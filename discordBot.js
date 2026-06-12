const {
  claimDiscordMigrationSession,
  importClaimedDiscordMigration
} = require('./discordMigration');

function loadDiscordJs() {
  try {
    return require('discord.js');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw error;
  }
}

function hasManageServer(interaction, discord) {
  return Boolean(interaction.memberPermissions?.has(discord.PermissionFlagsBits.ManageGuild));
}

function isSupportedChannel(channel, discord) {
  return channel?.type === discord.ChannelType.GuildCategory
    || channel?.type === discord.ChannelType.GuildText
    || channel?.type === discord.ChannelType.GuildVoice;
}

async function registerCommands(client, discord, guild) {
  const command = new discord.SlashCommandBuilder()
    .setName('jello-pair')
    .setDescription('Pair this Discord server with a JelloChat migration')
    .addStringOption((option) => option
      .setName('code')
      .setDescription('The JelloChat pairing code')
      .setRequired(true))
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageGuild);

  const targets = guild ? [guild] : Array.from(client.guilds.cache.values());
  for (const target of targets) {
    await target.commands.create(command);
  }
}

async function handlePair(interaction, db, discord) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'Run this command inside the server you want to migrate.', ephemeral: true });
    return;
  }
  if (!hasManageServer(interaction, discord)) {
    await interaction.reply({ content: 'You need Manage Server permission to pair this server.', ephemeral: true });
    return;
  }

  const code = String(interaction.options.getString('code') || '').trim().toUpperCase();
  try {
    await claimDiscordMigrationSession(db, code, interaction.guild, interaction.user);
    const row = new discord.ActionRowBuilder().addComponents(
      new discord.ButtonBuilder()
        .setCustomId(`jello-migrate:${code}`)
        .setLabel('Start JelloChat Migration')
        .setStyle(discord.ButtonStyle.Primary)
    );
    await interaction.reply({
      content: `Paired ${interaction.guild.name}. Click the button to import categories and text/voice channels. Messages and members are skipped.`,
      components: [row],
      ephemeral: true
    });
  } catch (error) {
    await interaction.reply({ content: error.message || 'Pairing failed.', ephemeral: true });
  }
}

async function handleMigrateButton(interaction, db, discord, onImported) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This button only works inside the paired server.', ephemeral: true });
    return;
  }
  if (!hasManageServer(interaction, discord)) {
    await interaction.reply({ content: 'You need Manage Server permission to start migration.', ephemeral: true });
    return;
  }

  const code = String(interaction.customId || '').split(':')[1] || '';
  await interaction.deferReply({ ephemeral: true });
  try {
    const fetched = await interaction.guild.channels.fetch();
    const channels = Array.from(fetched.values()).filter((channel) => isSupportedChannel(channel, discord));
    const result = await importClaimedDiscordMigration(db, code, interaction.guild, channels);
    if (typeof onImported === 'function') {
      await onImported(result.server.id);
    }
    await interaction.editReply(`Migration complete. Imported ${result.stats.categories} categories and ${result.stats.channels} channels.`);
  } catch (error) {
    await interaction.editReply(error.message || 'Migration failed.');
  }
}

async function startDiscordMigrationBot({ db, onImported } = {}) {
  const token = String(process.env.DISCORD_BOT_TOKEN || '').trim();
  if (!token) {
    console.log('Discord migration bot disabled: DISCORD_BOT_TOKEN is not set.');
    return null;
  }

  const discord = loadDiscordJs();
  if (!discord) {
    console.warn('Discord migration bot disabled: discord.js is not installed.');
    return null;
  }

  const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds] });
  client.once(discord.Events.ClientReady, async () => {
    console.log(`Discord migration bot logged in as ${client.user.tag}`);
    await registerCommands(client, discord).catch((error) => {
      console.warn(`Failed to register Discord migration commands: ${error.message}`);
    });
  });
  client.on(discord.Events.GuildCreate, async (guild) => {
    await registerCommands(client, discord, guild).catch((error) => {
      console.warn(`Failed to register Discord migration command for ${guild.name}: ${error.message}`);
    });
  });
  client.on(discord.Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand?.() && interaction.commandName === 'jello-pair') {
      await handlePair(interaction, db, discord);
      return;
    }
    if (interaction.isButton?.() && String(interaction.customId || '').startsWith('jello-migrate:')) {
      await handleMigrateButton(interaction, db, discord, onImported);
    }
  });

  await client.login(token);
  return client;
}

module.exports = { startDiscordMigrationBot };
