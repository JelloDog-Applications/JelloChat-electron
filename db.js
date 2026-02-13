const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

function loadEnv() {
  const candidates = [];

  function addCandidate(filePath) {
    if (!filePath) {
      return;
    }
    if (!candidates.includes(filePath)) {
      candidates.push(filePath);
    }
  }

  function addUpwardEnvCandidates(startDir, depth = 4) {
    if (!startDir) {
      return;
    }
    let current = path.resolve(startDir);
    for (let i = 0; i <= depth; i += 1) {
      addCandidate(path.join(current, '.env'));
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
  }

  addCandidate(process.env.JELLOCHAT_ENV_PATH);
  addUpwardEnvCandidates(process.cwd(), 5);
  addUpwardEnvCandidates(path.dirname(process.execPath || ''), 5);
  if (process.resourcesPath) {
    addUpwardEnvCandidates(process.resourcesPath, 3);
  }
  addUpwardEnvCandidates(__dirname, 3);

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
      return envPath;
    }
  }

  dotenv.config({ override: true });
  return null;
}

const loadedEnvPath = loadEnv();

let pool;

function createPool() {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'jellochat',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 10,
    idleTimeoutMillis: 30_000
  });
}

async function connect() {
  pool = createPool();
  try {
    const client = await pool.connect();
    client.release();
  } catch (error) {
    const envSource = loadedEnvPath || 'defaults/environment';
    error.message = `${error.message} (env source: ${envSource})`;
    throw error;
  }
}

function query(text, params = []) {
  if (!pool) {
    throw new Error('Database is not connected.');
  }
  return pool.query(text, params);
}

async function close() {
  if (pool) {
    await pool.end();
  }
}

module.exports = { connect, query, close };
