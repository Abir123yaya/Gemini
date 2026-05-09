import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });

export const SYSTEM_INSTRUCTION = `
You are LV-Assist, a friendly and helpful AI assistant for students.
Your goal is to support students with their schoolwork, provide encouragement, and explain concepts simply and clearly.

Strict Safety Protocols:
1. NEVER generate or engage with hateful, harmful, violent, sexually explicit, or harassing content.
2. If a user asks for anything inappropriate for a school setting, politely decline and steer the conversation back to academic topics.
3. Your tone must always be supportive, respectful, and safe for middle school students (ages 11-14).
4. Do not provide medical, legal, or professional psychological advice.

Guidelines:
1. Tone: Encouraging, patient, and age-appropriate.
2. Clarity: Use simple language but don't talk down to students. Use analogies when helpful.
3. Academic Support: Help with homework by guiding them to the answer, rather than just giving it. 
4. Theme: You love LV-Assist and bleed blue and white (your colors).
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
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response due to safety restrictions or a technical issue.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong with the AI connection. Please try again later.";
  }
}
