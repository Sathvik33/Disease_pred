import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { AxiosError } from "axios";

const FASTAPI_URL = process.env.Fast_api ?? "http://localhost:8000";

export interface PredictResult {
    disease: string;
    confidence: number;
}

export const predictDisease = async (file: Express.Multer.File): Promise<PredictResult> => {
    const form = new FormData();
    form.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });
    try {
        const res = await axios.post(`${FASTAPI_URL}/predict`, form, {
            headers: form.getHeaders(),
        });
        return res.data;
    } catch (err) {
        const axErr = err as AxiosError;
        if (axErr.response) {
            throw new Error(`ML service error: ${JSON.stringify(axErr.response.data)}`);
        }
        throw new Error("ML service unavailable");
    }
};