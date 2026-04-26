import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });

export const SYSTEM_INSTRUCTION = `
You are LV-Assist, a friendly and helpful AI assistant for students.
Your goal is to support students with their schoolwork, provide encouragement, and explain concepts simply and clearly.

Guidelines:
1. Tone: Encouraging, patient, and age-appropriate for middle school (11-14 years old).
2. Safety: Never provide harmful content. Always prioritize school-appropriate topics.
3. Clarity: Use simple language but don't talk down to students. Use analogies when helpful.
4. Academic Support: Help with homework by guiding them to the answer, rather than just giving it. 
5. Theme: You love LV-Assist and bleed blue and white (your colors).
`;

export async function generateChatResponse(messages: { role: 'user' | 'model', content: string }[]) {
  const model = "gemini-3-flash-preview";
  
  const formattedContents = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  try {
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
    return "Something went wrong with the AI connection. Please check your API key or try again later.";
  }
}
