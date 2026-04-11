import axios from "axios";
import FormData from "form-data"
import dotenv from "dotenv"
dotenv.config()
import { AxiosError } from "axios";

const FASTAPI_URL = process.env.Fast_api ?? "http://localhost:8000"

export interface PredictResult{
    disease: string,
    confidence: number
}

export const predictDisease = async (file: Express.Multer.File) => {
    const formData = new FormData();
    formData.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
    });
    try{
        const response = await axios.post(
            `${FASTAPI_URL}/predict`,
            formData,
            {
                headers: formData.getHeaders(),
            }
        );
        return response.data;
    }
    catch (err){
        const axiosErr = err as AxiosError;
        if(axiosErr.response){
            throw new Error(`ML Service Error: ${JSON.stringify(axiosErr.response.data)}`);
        }
        else{
            throw new Error("ML Service is Unavailabel...");
        }
    }
};