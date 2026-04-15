import pool from "../db";
import bcrypt from "bcrypt";

export const createUser = async (name: string, email: string, password: string) => {
    const hash = await bcrypt.hash(password, 10);
    const res = await pool.query(
        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, uid, name, email, created_at`,
        [name, email, hash]
    );
    return res.rows[0];
};

export const loginUser = async (email: string, password: string) => {
    const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (res.rows.length === 0) return null;

    const user = res.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return { id: user.id, uid: user.uid, name: user.name, email: user.email };
};

export const getUserById = async (id: number) => {
    const res = await pool.query(
        `SELECT id, uid, name, email, created_at FROM users WHERE id = $1`,
        [id]
    );
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
