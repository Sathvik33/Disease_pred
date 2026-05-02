import dotenv from "dotenv";
import path from "path";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import predictRoute from "./routes/predict";
import diagnoseRoute from "./routes/diagnose";
import userRoute from "./routes/user";
import initDB from "./schema";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173"
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".ngrok-free.app") ||
      origin.endsWith(".ngrok-free.dev") ||
      origin.endsWith(".ngrok.io")
    ) {
      return cb(null, true);
    }

    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
}));

app.use(express.json());
app.set("trust proxy", 1);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", predictRoute);
app.use("/api", diagnoseRoute);
app.use("/api", userRoute);

app.get("/", (_req, res) => {
    res.send("Disease Prediction API");
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        res.status(400).json({ error: err.message });
        return;
    }
    res.status(500).json({ error: err.message });
});
const PORT = Number(process.env.PORT || 5000);

initDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`server running on :${PORT}`);
    });
  })
  .catch((err) => {
    console.error("db init failed:", err);
    process.exit(1);
  });