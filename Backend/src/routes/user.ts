import express from "express";
import { Request, Response } from "express";
import { createUser, getUserById, getHistory } from "../services/user.service";

const userRoute = express.Router();

userRoute.post("/users", async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            res.status(400).json({ error: "name and email required" });
            return;
        }
        const user = await createUser(name, email);
        res.status(201).json(user);
    } catch (err: any) {
        if (err.code === "23505") {
            res.status(409).json({ error: "email already exists" });
            return;
        }
        res.status(500).json({ error: err.message });
    }
});

userRoute.get("/users/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await getUserById(parseInt(req.params.id as string));
        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

userRoute.get("/users/:id/history", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id as string);
        const user = await getUserById(userId);
        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        const history = await getHistory(userId);
        res.json({ user, history });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default userRoute;
