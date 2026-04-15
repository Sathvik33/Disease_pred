import pool from "./db";

const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
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

    const passCol = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password'
    `);
    if (passCol.rows.length === 0) {
        await pool.query(`ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''`);
    }

    const userCol = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'predictions' AND column_name = 'user_id'
    `);
    if (userCol.rows.length === 0) {
        await pool.query(`ALTER TABLE predictions ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);
    }
};

export default initDB;
