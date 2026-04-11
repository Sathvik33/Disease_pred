import express from "express";
import multer from "multer"
import { predictDisease } from "../services/ml.service";
import { Request, Response } from "express";
import { AxiosResponseTransformer } from "axios";

const predictRoute = express.Router();
const upload = multer();

predictRoute.post("/predict", upload.single("image"), async(req: Request, res: Response): Promise<void> => {
    try{
        const file = req.file;
        if(!file){
            res.status(400).json({error: "No image Uploaded"});
            return;
        }
        const result = await predictDisease(file);
        res.json(result);
    }
    catch(er: any){
        console.error(er);
        res.status(500).json({error: er.message})
    }
});

export default predictRoute;
