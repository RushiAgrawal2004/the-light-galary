import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available as an environment variable
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Bio generation will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateBio = async (keywords: string): Promise<string> => {
  if (!API_KEY) {
    return "API Key not configured. Please add your Gemini API key to use this feature.";
  }
  
  try {
    const prompt = `You are a creative assistant for a high-end modeling portfolio website called "The Gallery of Light". Your task is to write a short, elegant, and professional model biography (2-3 sentences). The tone should be artistic and sophisticated, avoiding clichés.

Based on these keywords, generate a bio: "${keywords}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating bio with Gemini API:", error);
    return "There was an error generating the bio. Please try again.";
  }
};
