require('dotenv').config({ path: './database.env' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // needed for Render external connections
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Run a simple query
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0].now);

    await client.end();
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

testConnection();
