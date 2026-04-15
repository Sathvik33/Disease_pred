import express from "express";
import { Request, Response } from "express";
import { createUser, loginUser, getUserById, getHistory } from "../services/user.service";
import auth, { AuthRequest, signToken } from "../middleware/auth";

const userRoute = express.Router();

userRoute.post("/register", async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: "name, email, and password required" });
            return;
        }
        const user = await createUser(name, email, password);
        const token = signToken(user.id);
        res.status(201).json({ user, token });
    } catch (err: any) {
        if (err.code === "23505") {
            res.status(409).json({ error: "email already exists" });
            return;
        }
        res.status(500).json({ error: err.message });
    }
});

userRoute.post("/login", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "email and password required" });
            return;
        }
        const user = await loginUser(email, password);
        if (!user) {
            res.status(401).json({ error: "invalid credentials" });
            return;
        }
        const token = signToken(user.id);
        res.json({ user, token });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

userRoute.get("/me", auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await getUserById(req.userId!);
        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

userRoute.get("/history", auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const history = await getHistory(req.userId!);
        res.json({ history });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default userRoute;
