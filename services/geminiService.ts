
import { GoogleGenAI, Type } from "@google/genai";
import { PilotAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getPilotAdvice(score: number, level: number): Promise<PilotAdvice> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player just scored ${score} points and reached level ${level} in Nova Strike. Give them one short sentence of tactical space combat advice and a cool callsign.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A cool callsign for the pilot" },
            advice: { type: Type.STRING, description: "Short tactical advice" }
          },
          required: ["title", "advice"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: "Rookie One",
      advice: "Keep moving and watch your six. The belt is unforgiving."
    };
  }
}
