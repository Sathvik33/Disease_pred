import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const secret = process.env.JWT_SECRET || "fallback_secret";

export interface AuthRequest extends Request {
    userId?: number;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ error: "token required" });
        return;
    }

    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, secret) as { id: number };
        req.userId = decoded.id;
        next();
    } catch (_) {
        res.status(401).json({ error: "invalid token" });
    }
};

export const signToken = (id: number): string => {
    return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

export default auth;
