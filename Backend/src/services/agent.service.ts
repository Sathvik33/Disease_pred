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
    let prediction;
    try {
        prediction = await predictDisease(file);
    } catch (err) {
        console.error("[agent.service] predictDisease failed:", err);
        throw err;
    }

    if (!prediction.is_plant) {
        return {
            prediction: {
                disease: prediction.disease,
                confidence: prediction.confidence,
                is_plant: false,
            },
            advisory: null,
            error: "this image does not appear to be a crop or plant leaf. please upload a clear photo of a plant leaf for diagnosis.",
        };
    }

    let advisory: string;
    try {
        advisory = await runAgent(
            prediction.disease,
            prediction.confidence,
            lat,
            lon
        );
    } catch (err) {
        console.error("[agent.service] runAgent failed:", err);
        throw err;
    }

    try {
        await pool.query(
            `INSERT INTO predictions (user_id, disease, confidence, latitude, longitude, advisory, ip)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userId || null, prediction.disease, prediction.confidence, lat, lon, advisory, ip]
        );
    } catch (err) {
        console.error("[agent.service] DB insert failed:", err);
        // Non-fatal — don't throw, still return result
    }

    return {
        prediction: {
            disease: prediction.disease,
            confidence: prediction.confidence,
            is_plant: true,
        },
        advisory,
    };
};

