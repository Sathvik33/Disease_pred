import { predictDisease } from "./ml.service";
import { runAgent } from "../agent/plantAgent";
import pool from "../db";

export const getDiagnosis = async (
    file: Express.Multer.File,
    lat: number,
    lon: number,
    ip: string
) => {
    const prediction = await predictDisease(file);

    const advisory = await runAgent(
        prediction.disease,
        prediction.confidence,
        lat,
        lon
    );

    await pool.query(
        `INSERT INTO predictions (disease, confidence, latitude, longitude, advisory, ip)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [prediction.disease, prediction.confidence, lat, lon, advisory, ip]
    );

    return { prediction, advisory };
};
