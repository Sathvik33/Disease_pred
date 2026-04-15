import pool from "./db";

const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS predictions (
            id SERIAL PRIMARY KEY,
            disease VARCHAR(100) NOT NULL,
            confidence REAL NOT NULL,
            latitude REAL,
            longitude REAL,
            advisory TEXT,
            ip VARCHAR(45),
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);
};

export default initDB;
