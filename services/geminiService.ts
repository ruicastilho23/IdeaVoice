
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingResult } from '../types';
import { blobToBase64 } from '../utils';

export const processAudioNote = async (audioBlob: Blob, language: 'en' | 'th' = 'en'): Promise<ProcessingResult> => {
  try {
const apiKey = process.env.GEMINI_API_KEY;    if (!apiKey) {
      throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Audio = await blobToBase64(audioBlob);

    // Schema definition for structured output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A creative and concise title for the voice note" },
        transcription: { type: Type.STRING, description: "Full verbatim transcription of the audio" },
        summary: { type: Type.STRING, description: "A 1-2 sentence summary of the main idea" },
        keyPoints: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of key points or bullet ideas"
        },
        tags: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Relevant categories or tags (max 3)"
        },
        actionItems: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Actionable tasks derived from the note, if any"
        },
      },
      required: ["title", "transcription", "summary", "keyPoints", "tags"],
    };

    let promptText = "Transcribe this audio precisely. Then, act as an expert editor: provide a catchy title, a short summary, key bullet points, extract 1-3 relevant tags, and list any actionable tasks if present.";
    
    if (language === 'th') {
      promptText += " IMPORTANT: Provide all output fields (title, summary, keyPoints, tags, actionItems) in Thai language. For the transcription, write exactly what was said (if mixed language, keep mixed).";
    } else {
      promptText += " Keep the tone helpful and concise.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || 'audio/webm',
              data: base64Audio
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(resultText) as ProcessingResult;

  } catch (error) {
    console.error("Error processing audio note:", error);
    // Return a fallback in case of error to avoid crashing the UI flow entirely
    return {
      title: language === 'th' ? "โน้ตไม่มีชื่อ (การประมวลผลล้มเหลว)" : "Untitled Note (Processing Failed)",
      transcription: language === 'th' ? "ไม่สามารถถอดความได้เนื่องจากข้อผิดพลาด" : "Transcription unavailable due to an error.",
      summary: language === 'th' ? "ไม่สามารถสร้างสรุปได้" : "Could not generate summary.",
      keyPoints: [],
      tags: ["error"],
      actionItems: []
    };
  }
};
