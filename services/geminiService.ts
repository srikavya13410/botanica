
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { User } from "../types";

// Use process.env.API_KEY directly as per Gemini API guidelines.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Refactored to use responseSchema for reliable JSON output.
export const identifyPlant = async (base64Image: string) => {
    const prompt = `You are a botanical expert. Based on the provided image of a plant, identify it and provide its common name, typical lifespan, seasonal information (flowers/fruits), practical uses (including toxicity warnings), ideal environment, and watering frequency.`;
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The common name of the plant." },
                    lifeSpan: { type: Type.STRING, description: "The typical lifespan of the plant." },
                    seasonalInfo: { type: Type.STRING, description: "Information about its flowering and fruiting seasons." },
                    usefulInfo: { type: Type.STRING, description: "Any medicinal, culinary, or other practical uses, including toxicity information." },
                    environment: { type: Type.STRING, description: "The ideal soil, sunlight, and temperature conditions." },
                    wateringFrequency: { type: Type.STRING, description: "How often the plant needs to be watered." },
                },
                required: ["name", "lifeSpan", "seasonalInfo", "usefulInfo", "environment", "wateringFrequency"]
            }
        }
    });

    return JSON.parse(response.text);
};

export const getPlantInfoByName = async (plantName: string) => {
    const prompt = `You are a botanical expert. For the plant named "${plantName}", provide its common name, typical lifespan, seasonal information (flowers/fruits), practical uses (including toxicity warnings), ideal environment, and watering frequency. Also provide a detailed visual description of a single, healthy plant on a plain background, suitable for an image generation model (as 'imagePrompt').`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The common name of the plant." },
                    lifeSpan: { type: Type.STRING, description: "The typical lifespan of the plant." },
                    seasonalInfo: { type: Type.STRING, description: "Information about its flowering and fruiting seasons." },
                    usefulInfo: { type: Type.STRING, description: "Any medicinal, culinary, or other practical uses, including toxicity information." },
                    environment: { type: Type.STRING, description: "The ideal soil, sunlight, and temperature conditions." },
                    wateringFrequency: { type: Type.STRING, description: "How often the plant needs to be watered." },
                    imagePrompt: { type: Type.STRING, description: "A detailed visual description of the plant for an image generation model." }
                },
                required: ["name", "lifeSpan", "seasonalInfo", "usefulInfo", "environment", "wateringFrequency", "imagePrompt"]
            }
        }
    });
    return JSON.parse(response.text);
};


// Refactored to use responseSchema for reliable JSON output.
export const getFilteredRecommendations = async (medicalCondition: string, preferences: { type: string; flowering: string; size: string; }) => {
    const prompt = `A user with "${medicalCondition}" is looking for a plant with these traits:
    - Type: ${preferences.type}
    - Flowering: ${preferences.flowering}
    - Size: ${preferences.size}
    
    Recommend up to 5 plants that fit these criteria.
    Crucially, the recommendations should be plants that are very common and well-known in India, or are globally recognized household plants (like Snake Plant, Spider Plant, etc.). Prioritize plants that an average person in India would likely recognize (e.g., Tulsi, Marigold, Aloe Vera).
    For each plant, provide its name, lifespan, seasonal info, useful info, environment, watering frequency, and a detailed visual description for an image generation model ('imagePrompt').
    The most important step is safety verification. Cross-verify each recommendation with the user's condition ("${medicalCondition}"). This includes a boolean 'isSafe' and a detailed 'safetyExplanation'. 'isSafe' must be 'true' only if the plant is broadly considered safe for the user's condition. 'safetyExplanation' must detail any potential risks (allergens, toxins, physical challenges like thorns) or confirm its safety. If there are known risks, 'isSafe' must be 'false'. Prioritize safety above all. In the 'usefulInfo' field, also briefly mention any specific benefits for a user with this condition (e.g., 'Its smooth leaves and sturdy stems make it easy to handle for those with joint pain.').`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        lifeSpan: { type: Type.STRING },
                        seasonalInfo: { type: Type.STRING },
                        usefulInfo: { type: Type.STRING },
                        environment: { type: Type.STRING },
                        wateringFrequency: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING, description: "A detailed visual description of the plant for an image generation model." },
                        isSafe: { type: Type.BOOLEAN, description: "A boolean indicating if the plant is generally considered safe for the user's specified condition." },
                        safetyExplanation: { type: Type.STRING, description: "A detailed explanation of the safety considerations, warnings, or confirmation of safety." }
                    },
                    required: ["name", "lifeSpan", "seasonalInfo", "usefulInfo", "environment", "wateringFrequency", "imagePrompt", "isSafe", "safetyExplanation"]
                }
            }
        }
    });

    return JSON.parse(response.text);
};

export const generatePlantImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
    }
    throw new Error("Image generation failed");
};


export const getEncyclopediaInfo = async (query: string) => {
    const prompt = `You are a comprehensive botanical encyclopedia. The user wants to know about "${query}". 
    Provide a detailed description. If it's a specific plant, detail each part (roots, stem, leaves, flowers, fruits, seeds), its life cycle, uses, care, and any warnings in a dedicated 'Warnings' section. 
    If it's a botanical term (like 'photosynthesis'), explain it clearly. 
    Format the response using Markdown with headings for different sections.
    Also provide a detailed visual description of the plant or a concept representing the term for an image generation model (as 'imagePrompt').`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "The full encyclopedia entry in Markdown format, including headings for different sections like 'Care', 'Uses', and 'Warnings'." },
                    imagePrompt: { type: Type.STRING, description: "A detailed visual description for an image generation model." }
                },
                required: ["description", "imagePrompt"]
            }
        }
    });

    return JSON.parse(response.text);
};

// Fix: Add getHealthTip function to resolve error in Dashboard.tsx
export const getHealthTip = async (medicalCondition: string) => {
    const prompt = `Provide a short, positive, and encouraging gardening-related health tip for someone with "${medicalCondition}". The tip should be about how gardening can be beneficial. Keep it under 50 words.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};

export const getUnsafePlants = async (medicalCondition: string, searchQuery?: string) => {
    const prompt = `You are a toxicologist and botanist specializing in plant safety for individuals with medical conditions. A user with "${medicalCondition}" is asking for a list of plants they should avoid worldwide. ${searchQuery ? `The user is specifically searching for "${searchQuery}", so filter the list to plants matching that term.` : ''} For each plant, provide its primary common name, an array of other common names, and a detailed but easy-to-understand reason why it is unsafe for someone with their condition (e.g., allergenic pollen, toxic if ingested, sharp thorns posing a risk for those with mobility issues, etc.). Provide a comprehensive list if no search query is given.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The primary common name of the unsafe plant." },
                        commonNames: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of other common names for the plant."
                        },
                        reason: { type: Type.STRING, description: "A detailed explanation of why the plant is unsafe for the specified medical condition." },
                    },
                    required: ["name", "commonNames", "reason"]
                }
            }
        }
    });

    return JSON.parse(response.text);
};

export const startAIGuideChat = (user: User): Chat => {
    const systemInstruction = `You are Botanica AI Guide, a friendly and expert gardening assistant.
Your goal is to help the user with their gardening questions and guide them through the Botanica app.

User Details:
- Username: ${user.username}
- Medical Condition: ${user.medicalCondition || 'Not specified'}

Botanica App Features:
- Dashboard: The main screen with an overview.
- My Garden: Where users add and view their plants.
- Reminders: To set watering or care notifications.
- For You (Recommendations): Personalized plant suggestions.
- Discover (Encyclopedia): A search tool for any botanical term or plant.
- Warnings: Lists plants to be cautious about based on the user's condition.

Your tasks:
1.  Answer gardening questions (e.g., soil types, planting times, pest control). If the user asks for weather-related or seasonal advice, be sure to ask for their location first.
2.  Guide the user on how to use the app's features. For example, if they ask "how to add a plant?", tell them to go to the "My Garden" tab.
3.  Be conversational, encouraging, and clear in your responses. Keep answers concise and easy to understand.`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return chat;
};