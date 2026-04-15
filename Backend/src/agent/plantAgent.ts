import { ChatOllama } from "@langchain/ollama";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { weatherTool, treatmentSearch, diseaseSearch } from "./tools";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const llm = new ChatOllama({
    model: process.env.OLLAMA_MODEL || "qwen2.5:7b",
    baseUrl: process.env.OLLAMA_URL || "http://127.0.0.1:11434",
    temperature: 0,
});

const tools = [weatherTool, treatmentSearch, diseaseSearch];

const agent = createReactAgent({
    llm,
    tools,
});

export const runAgent = async (
    disease: string,
    confidence: number,
    lat: number,
    lon: number
): Promise<string> => {
    const prompt = `You are an expert agricultural advisor. A plant disease detection model has identified the following:

Disease: ${disease}
Confidence: ${(confidence * 100).toFixed(1)}%
Location coordinates: ${lat}, ${lon}

Your task:
1. Use search_disease_info to look up information about this disease (search for the disease name with plant name)
2. Use search_treatment to find current treatment recommendations and medicines for this disease
3. Use get_weather with the given coordinates to check current and recent weather conditions
4. Analyze how the weather conditions relate to this disease
5. Provide a clear, actionable advisory for the farmer including:
   - What the disease is and how serious it is
   - How current weather may affect disease progression
   - Specific treatment recommendations (both chemical and organic options)
   - Immediate precautions to take
   - Preventive measures for the future

Be concise and practical. The farmer needs actionable advice, not a textbook.`;

    const result = await agent.invoke({
        messages: [{ role: "user", content: prompt }],
    });

    const msgs = result.messages;
    const last = msgs[msgs.length - 1];
    return typeof last.content === "string" ? last.content : JSON.stringify(last.content);
};
