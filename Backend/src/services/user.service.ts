import pool from "../db";

export const createUser = async (name: string, email: string) => {
    const res = await pool.query(
        `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *`,
        [name, email]
    );
    return res.rows[0];
};

export const getUserById = async (id: number) => {
    const res = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return res.rows[0] || null;
};

export const getHistory = async (userId: number) => {
    const res = await pool.query(
        `SELECT id, disease, confidence, latitude, longitude, advisory, created_at
         FROM predictions WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );
    return res.rows;
};
