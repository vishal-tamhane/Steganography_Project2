const { Pool } = require('pg');
require('dotenv').config();

// Prefer a single DATABASE_URL (e.g., Neon) but fall back to individual env vars
const connectionString = process.env.DATABASE_URL ||
    `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Reuse the pool across module reloads (helps with serverless environments and prevents connection exhaustion)
if (!global.__pgPool) {
    const poolConfig = {
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
    };

    // If using Neon/other managed Postgres over TLS, ensure SSL config is present
    if (connectionString && connectionString.includes('neon')) {
        poolConfig.ssl = { rejectUnauthorized: false };
    }

    global.__pgPool = new Pool(poolConfig);
}

const pool = global.__pgPool;

// Create users table if it doesn't exist (keeps existing startup behavior)
const createUsersTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created or already exists');
    } catch (err) {
        console.error('Error creating users table:', err);
    }
};

createUsersTable();

module.exports = pool;