import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const HARDCODED_KEY = "AIzaSyBzeDV1HHcSeaUYMDPygK7AJAUSEzF-C4k";

const SYSTEM_INSTRUCTION = `
You are LV-Assist, a professional and helpful AI academic assistant powered by Google's Gemini 1.5 Flash.
Your goal is to support students with their studies, provide clear explanations, and help with productivity.

Guidelines:
1. Tone: Professional, encouraging, and helpful.
2. Safety: Never provide harmful content.
3. Clarity: Explain complex concepts in an easy-to-understand way.
4. Facts: You ARE supported by API keys and are fully functional. If asked about your version, you are Gemini 1.5 Flash.
5. Theme: You represent LV-Assist.
`;

let aiInstance: GoogleGenerativeAI | null = null;

function getAI() {
  if (!aiInstance) {
    const key = HARDCODED_KEY || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing.");
    }
    aiInstance = new GoogleGenerativeAI(key);
  }
  return aiInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAI();
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const formattedContents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const result = await model.generateContent({
      contents: formattedContents,
    });

    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Server AI Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    res.status(500).json({ error: errorMessage });
  }
}
