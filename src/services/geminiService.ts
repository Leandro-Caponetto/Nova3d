import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function chatWithAssistant(messages: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages,
    config: {
      systemInstruction: "Eres un asistente experto para Nova3D, un servicio de impresión 3D profesional. Tu objetivo es ayudar a los usuarios a cotizar sus proyectos, explicar materiales (PLA, ABS, PETG, Resina) y dar consejos sobre diseño para impresión 3D. Mantén un tono profesional, tecnológico y amable. Si el usuario pregunta por precios, menciona que el costo base es por gramo/hora y que puede usar el cotizador de la web.",
    }
  });

  const response = await model;
  return response.text;
}
