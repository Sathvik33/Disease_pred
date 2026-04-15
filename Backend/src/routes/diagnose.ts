import express from "express";
import multer from "multer";
import { getDiagnosis } from "../services/agent.service";
import { Request, Response } from "express";
import { diagnoseLimiter } from "../middleware/limiter";

const diagnoseRoute = express.Router();
const upload = multer();

diagnoseRoute.post("/diagnose", diagnoseLimiter, upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "no image uploaded" });
            return;
        }

        const lat = parseFloat(req.body.latitude);
        const lon = parseFloat(req.body.longitude);

        if (isNaN(lat) || isNaN(lon)) {
            res.status(400).json({ error: "latitude and longitude required" });
            return;
        }

        const ip = req.ip || "unknown";
        const userId = req.body.user_id ? parseInt(req.body.user_id) : undefined;
        const result = await getDiagnosis(file, lat, lon, ip, userId);
        res.json(result);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default diagnoseRoute;
