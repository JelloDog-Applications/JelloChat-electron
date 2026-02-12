const { Pool } = require('pg');
require('dotenv').config();

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
  const client = await pool.connect();
  client.release();
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