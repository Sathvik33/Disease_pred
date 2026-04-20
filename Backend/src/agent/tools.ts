import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";
import { tavily } from "@tavily/core";
import { search as ddgSearch } from "duck-duck-scrape";
import { lookupTreatment, lookupDisease } from "../services/treatment.service";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });

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

        return {
            current: {
                temperature: cur.temperature_2m,
                humidity: cur.relative_humidity_2m,
                precipitation: cur.precipitation,
                wind: cur.wind_speed_10m
            },
            history: hist.time.map((t: string, i: number) => ({
                date: t,
                temp_max: hist.temperature_2m_max[i],
                temp_min: hist.temperature_2m_min[i],
                rain: hist.precipitation_sum[i]
            }))
        };
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

const treatmentSearch = tool(
    async ({ query, disease }) => {
        try {
            const res = await tvly.search(query, {
                searchDepth: "advanced",
                maxResults: 5,
                includeAnswer: true,
            });

            const parts: string[] = [];
            if (res.answer) parts.push(`Summary: ${res.answer}`);
            for (const r of res.results) {
                parts.push(`[${r.title}] ${r.content}`);
            }

            if (parts.length > 0) return parts.join("\n\n");
        } catch (_) { }

        if (disease) return lookupTreatment(disease);

        return "search failed and no fallback data available";
    },
    {
        name: "search_treatment",
        description: "Search the web for treatment recommendations, medicines, fungicides, and precautions for a plant disease. Falls back to local database if search fails.",
        schema: z.object({
            query: z.string().describe("search query like 'Apple Cedar Apple Rust treatment fungicide recommendations'"),
            disease: z.string().optional().describe("disease class name like Apple___Cedar_apple_rust for fallback lookup"),
        }),
    }
);

const diseaseSearch = tool(
    async ({ query, disease }) => {
        try {
            const res = await ddgSearch(query, { safeSearch: 0 });

            if (res.results && res.results.length > 0) {
                const top = res.results.slice(0, 5);
                return top.map(r => `[${r.title}] ${r.description}`).join("\n\n");
            }
        } catch (_) { }

        if (disease) return lookupDisease(disease);

        return "search failed and no fallback data available";
    },
    {
        name: "search_disease_info",
        description: "Search the web for information about a plant disease including causes, symptoms, and spread patterns. Falls back to local database if search fails.",
        schema: z.object({
            query: z.string().describe("search query like 'Apple Cedar Apple Rust disease causes symptoms'"),
            disease: z.string().optional().describe("disease class name like Apple___Cedar_apple_rust for fallback lookup"),
        }),
    }
);

export { weatherTool, treatmentSearch, diseaseSearch };
