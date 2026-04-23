import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { weatherTool, treatmentSearch, diseaseSearch } from "./tools";


const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "llama-3.3-70b-versatile",
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
    const prompt = `You are an expert agricultural advisor assisting a farmer in real-world conditions.

A plant disease detection system has produced the following:

- Disease: ${disease}
- Confidence: ${(confidence * 100).toFixed(1)}%
- Location: Latitude ${lat}, Longitude ${lon}

You MUST follow these rules strictly:

1. ALWAYS use the provided tools:
   - search_disease_info → for disease details
   - search_treatment → for treatments and medicines
   - get_weather → for current + recent weather

2. DO NOT assume anything:
   - Base your reasoning ONLY on tool outputs
   - If weather does NOT strongly support disease spread, say that clearly

3. Use confidence score:
   - If confidence > 80% → give direct treatment advice
   - If 50–80% → suggest confirmation + treatment
   - If < 50% → warn about possible misclassification

4. Be practical, not academic:
   - Avoid textbook explanations
   - Speak like a field advisor helping a farmer

5. PRIORITIZE actions:
   - Farmers need to know what to do FIRST

---

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

🚨 **Immediate Actions (Do this first)**
1. ...
2. ...
3. ...

🌿 **Disease Summary**
- What it is (1–2 lines max)
- Severity (Low / Moderate / High)

🌦 **Weather Impact Analysis**
- What the current weather actually indicates
- Whether it helps or slows disease spread

💊 **Treatment Plan**
- Chemical options
- Organic options

🛡 **Prevention (Next 7–14 days)**
- Practical steps to avoid spread

⚠️ **Confidence Note**
- Explain reliability of prediction based on confidence score

---

Keep response:
- Clear
- Short
- Actionable
- No unnecessary theory
`;
    const result = await agent.invoke({
        messages: [{ role: "user", content: prompt }],
    });

    const msgs = result.messages;
    const last = msgs[msgs.length - 1];
    return typeof last.content === "string" ? last.content : JSON.stringify(last.content);
};
