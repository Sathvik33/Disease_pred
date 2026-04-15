import { predictDisease } from "./ml.service";
import { runAgent } from "../agent/plantAgent";
import pool from "../db";

export const getDiagnosis = async (
    file: Express.Multer.File,
    lat: number,
    lon: number,
    ip: string,
    userId?: number
) => {
    const prediction = await predictDisease(file);

    if (!prediction.is_plant) {
        return {
            prediction: {
                disease: prediction.disease,
                confidence: prediction.confidence,
                is_plant: false,
                top3: prediction.top3,
            },
            advisory: null,
            error: "this image does not appear to be a crop or plant leaf. please upload a clear photo of a plant leaf for diagnosis.",
        };
    }

    const advisory = await runAgent(
        prediction.disease,
        prediction.confidence,
        lat,
        lon
    );

    await pool.query(
        `INSERT INTO predictions (user_id, disease, confidence, latitude, longitude, advisory, ip)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId || null, prediction.disease, prediction.confidence, lat, lon, advisory, ip]
    );

    return {
        prediction: {
            disease: prediction.disease,
            confidence: prediction.confidence,
            is_plant: true,
            top3: prediction.top3,
        },
        advisory,
    };
};
