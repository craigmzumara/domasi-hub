require('dotenv').config({ path: './database.env' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function insertUser() {
  try {
    await client.connect();
    console.log('✅ Connected');

    const result = await client.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) RETURNING *`,
      ['eden_test', 'eden@example.com', 'hashedpassword123']
    );

    console.log('Inserted user:', result.rows[0]);

    await client.end();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

insertUser();