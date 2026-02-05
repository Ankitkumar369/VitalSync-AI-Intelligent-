
import { GoogleGenAI, Type } from "@google/genai";
import { ActivityLog, MealRecommendation, AQIStatus, MentalExercise, NewsItem } from "../types";

// Helper to create instance with the latest key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDietRecommendation = async (activities: ActivityLog[]): Promise<MealRecommendation[]> => {
  const ai = getAI();
  const activitySummary = activities.map(a => `${a.type} for ${a.duration} mins`).join(', ');
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on today's activities: ${activitySummary || 'Sedentary/Minimal activity'}. Suggest a high-nutrition meal plan (Breakfast, Lunch, Dinner).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            meal: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fats: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["meal", "calories", "protein", "carbs", "fats", "reason"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};

export const getGlobalHealthNews = async (): Promise<NewsItem[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Fetch the latest 5 global health, fitness, and medical breakthroughs from the last 24 hours. Provide titles, summaries, and source names.",
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const lines = response.text.split('\n').filter(l => l.length > 20).slice(0, 5);
  
  const sources = grounding
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri
    }));

  return lines.map((line, i) => ({
    title: line.substring(0, 80) + "...",
    summary: line,
    url: sources[i]?.uri || "https://health.google.com",
    source: sources[i]?.title || "Global Health News",
    timestamp: "Live Now"
  }));
};

export const findNearbyFacilities = async (query: string, lat: number, lng: number) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find ${query} near my current location.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    }
  });
  
  return {
    text: response.text,
    places: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateImagePro = async (prompt: string, size: "1K" | "2K" | "4K") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: size }
    },
  });
  
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const editImageNano = async (prompt: string, base64Image: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType } },
        { text: prompt },
      ],
    },
  });
  
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const generateVideoVeo = async (prompt: string, ratio: '16:9' | '9:16', image?: { bytes: string, mime: string }) => {
  const ai = getAI();
  const config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: ratio
  };

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: image ? { imageBytes: image.bytes.split(',')[1], mimeType: image.mime } : undefined,
    config
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

export const getAQIAdvice = async (location: string): Promise<AQIStatus> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `What is the current AQI in ${location}? Give survival advice.`,
    config: { tools: [{ googleSearch: {} }] }
  });

  const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return {
    index: 0,
    category: "Verified Info",
    recommendation: response.text,
    sources: grounding.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }))
  };
};

export const getWeatherBasedActivities = async (location: string): Promise<{recommendation: string; sources: {title: string; uri: string}[]}> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Current weather in ${location} and activities?`,
    config: { tools: [{ googleSearch: {} }] }
  });

  const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return {
    recommendation: response.text,
    sources: grounding.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }))
  };
};

export const getMentalHealthAdvice = async (goal: string): Promise<MentalExercise[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Exercises for ${goal}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            benefit: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["title", "description", "steps", "benefit", "category"]
        }
      }
    }
  });
  try { return JSON.parse(response.text); } catch { return []; }
};

export const analyzeHealthSymptom = async (symptom: string, currentActivityLevel: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Symptom: ${symptom}. Activity: ${currentActivityLevel}.`,
    config: { thinkingConfig: { thinkingBudget: 4000 } }
  });
  return response.text;
};
