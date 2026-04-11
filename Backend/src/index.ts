import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import predictRoute from "./routes/predict";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({status: "Ok"}));
app.use("/api", predictRoute);

app.get("/", (req, res) => {
    res.send("Hi There!");
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: err.message });
});

app.listen(5000, () => {
    console.log("Server is running");
});