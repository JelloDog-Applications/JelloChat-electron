const db = require('./db');

async function getAppSetting(key) {
  const result = await db.query('SELECT value FROM app_settings WHERE key = $1', [key]);
  return result.rows[0]?.value ?? null;
}

async function setAppSetting(key, value) {
  await db.query(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key)
     DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, String(value)]
  );
}

async function deleteAppSetting(key) {
  await db.query('DELETE FROM app_settings WHERE key = $1', [key]);
}

module.exports = { getAppSetting, setAppSetting, deleteAppSetting };
