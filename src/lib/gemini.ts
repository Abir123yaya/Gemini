import { GoogleGenAI } from "@google/genai";

// You can add your key here or use the environment variable
const HARDCODED_KEY = "AIzaSyBzeDV1HHcSeaUYMDPygK7AJAUSEzF-C4k";

const SYSTEM_INSTRUCTION = `
You are LV-Assist, a professional and helpful AI academic assistant.
Your goal is to support students with their studies, provide clear explanations, and help with productivity.

Guidelines:
1. Tone: Professional, encouraging, and helpful.
2. Safety: Never provide harmful content.
3. Clarity: Explain complex concepts in an easy-to-understand way. Use analogies when helpful.
4. Academic Support: Guide students toward answers through reasoning rather than just providing them.
5. Theme: You represent LV-Assist and use a professional blue and white color scheme.
`;

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const key = HARDCODED_KEY || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please add it to your environment variables or hardcode it in src/lib/gemini.ts.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

export async function generateChatResponse(messages: { role: 'user' | 'model', content: string }[]) {
  try {
    const ai = getAI();
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes("API_KEY_INVALID")) {
      return "⚠️ **API Key Error**: The API key provided is invalid. Please check your key.";
    }
    return "Something went wrong. Please check your internet connection or try again later.";
  }
}
