import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";
import { lookupTreatment, lookupDisease } from "../services/treatment.service";

const weatherTool = tool(
    async ({ latitude, longitude }) => {
        const today = new Date();
        const end = today.toISOString().split("T")[0];
        const start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            .toISOString().split("T")[0];

        const [forecast, history] = await Promise.all([
            axios.get("https://api.open-meteo.com/v1/forecast", {
                params: {
                    latitude,
                    longitude,
                    current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
                    timezone: "auto",
                }
            }),
            axios.get("https://archive-api.open-meteo.com/v1/archive", {
                params: {
                    latitude,
                    longitude,
                    start_date: start,
                    end_date: end,
                    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
                    timezone: "auto",
                }
            })
        ]);

        const cur = forecast.data.current;
        const hist = history.data.daily;

        const days = hist.time.map((t: string, i: number) => (
            `${t}: high ${hist.temperature_2m_max[i]}°C, low ${hist.temperature_2m_min[i]}°C, rain ${hist.precipitation_sum[i]}mm`
        ));

        return [
            `Current: ${cur.temperature_2m}°C, humidity ${cur.relative_humidity_2m}%, precipitation ${cur.precipitation}mm, wind ${cur.wind_speed_10m}km/h`,
            `Past 7 days:`,
            ...days
        ].join("\n");
    },
    {
        name: "get_weather",
        description: "Get current weather and past 7 days historical weather data for a location",
        schema: z.object({
            latitude: z.number().describe("latitude of the location"),
            longitude: z.number().describe("longitude of the location"),
        }),
    }
);

const treatmentTool = tool(
    async ({ disease }) => {
        return lookupTreatment(disease);
    },
    {
        name: "get_treatment",
        description: "Get treatment recommendations including chemical, organic, and cultural methods for a plant disease",
        schema: z.object({
            disease: z.string().describe("disease class name like Tomato___Late_blight"),
        }),
    }
);

const diseaseTool = tool(
    async ({ disease }) => {
        return lookupDisease(disease);
    },
    {
        name: "get_disease_info",
        description: "Get detailed information about a plant disease including causes, symptoms, severity, and favorable conditions",
        schema: z.object({
            disease: z.string().describe("disease class name like Tomato___Late_blight"),
        }),
    }
);

export { weatherTool, treatmentTool, diseaseTool };
