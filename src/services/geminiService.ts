import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getAI() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "undefined") {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

export const SYSTEM_INSTRUCTION = `
You are LV-Assist, a professional and helpful AI academic assistant.
Your goal is to support students with their studies, provide clear explanations, and help with productivity.

Guidelines:
1. Tone: Professional, encouraging, and helpful.
2. Safety: Never provide harmful content.
3. Clarity: Explain complex concepts in an easy-to-understand way. Use analogies when helpful.
4. Academic Support: Guide students toward answers through reasoning rather than just providing them.
5. Theme: You represent LV-Assist and use a professional blue and white color scheme.
`;

export async function generateChatResponse(messages: { role: 'user' | 'model', content: string }[]) {
  const model = "gemini-3-flash-preview";
  
  const formattedContents = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
