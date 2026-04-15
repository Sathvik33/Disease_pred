import express from "express";
import multer from "multer";
import { predictDisease } from "../services/ml.service";
import { Request, Response } from "express";
import { apiLimiter } from "../middleware/limiter";

const predictRoute = express.Router();
const upload = multer();

predictRoute.post("/predict", apiLimiter, upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "no image uploaded" });
            return;
        }
        const result = await predictDisease(file);
        res.json(result);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default predictRoute;
