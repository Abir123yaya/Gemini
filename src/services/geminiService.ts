import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// TO ADD KEY DIRECTLY: Paste your key between the quotes below
// Example: const HARDCODED_KEY = "AIzaSy...";
const HARDCODED_KEY = "AIzaSyBzeDV1HHcSeaUYMDPygK7AJAUSEzF-C4k";

let aiInstance: GoogleGenAI | null = null;

export function getAI() {
  if (!aiInstance) {
    // 1. Try hardcoded key first
    let key = HARDCODED_KEY;
    
    // 2. Fallback to various environment variable names
    if (!key || key.trim() === "") {
      key = process.env.GEMINI_API_KEY || 
            process.env.VITE_GEMINI_API_KEY || 
            process.env.GOOGLE_API_KEY ||
            process.env.API_KEY ||
            "";
    }
    
    // Diagnostic logging for debugging (only keys, safe)
    const availableKeys = Object.keys(process.env).filter(k => 
      k.includes("API") || k.includes("KEY") || k.includes("GEMINI")
    );
    console.log("Key resolution check. Found env keys:", availableKeys);
    
    if (!key || key === "MY_GEMINI_API_KEY" || key === "undefined" || key.trim() === "") {
      const errorMsg = `GEMINI_API_KEY is missing.
Possible Fixes:
1. Settings > Secrets: Add a secret named 'GEMINI_API_KEY'
2. Add the key directly in src/services/geminiService.ts
3. Available keys in this environment: ${availableKeys.join(", ") || "None found"}`;
      throw new Error(errorMsg);
    }
    aiInstance = new GoogleGenAI({ apiKey: key.trim() });
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
