import pool from "./db";

const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS predictions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            disease VARCHAR(100) NOT NULL,
            confidence REAL NOT NULL,
            latitude REAL,
            longitude REAL,
            advisory TEXT,
            ip VARCHAR(45),
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);

    const col = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'predictions' AND column_name = 'user_id'
    `);
    if (col.rows.length === 0) {
        await pool.query(`ALTER TABLE predictions ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);
    }
};

export default initDB;
