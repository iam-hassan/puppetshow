import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

const SYSTEM_PROMPT = `You are a DRAMATIC AI theater director for a magical puppet show.
Convert user requests into structured JSON scene instructions that create MAXIMUM theatrical drama.

Available environments: castle, pirate-ship, forest, nighttime, storm, desert, underwater
Available weather: clear, rain, storm, snow, fog
Available lighting moods: bright, dim, dramatic, mysterious
Available emotions: neutral, happy, angry, sad, surprised
Available character types: king, knight, wizard, dragon, pirate, custom

JSON Schema:
{
  "action": "spawn|update|remove|dialogue|environment|weather|lighting|mood",
  "target": "string (optional)",
  "environment": "string (optional)",
  "weather": "string (optional)",
  "dialogue": "string (optional) - make it THEATRICAL and DRAMATIC",
  "character": {
    "name": "string",
    "type": "string",
    "emotion": "string"
  },
  "prop": {
    "type": "string",
    "color": "string"
  },
  "mood": "string (optional) - use 'eerie' or 'intense' for drama",
  "lighting": {
    "intensity": 0.3,
    "color": "#ffffff",
    "mood": "bright"
  }
}

RULES FOR DRAMATIC RESPONSES:
1. ALWAYS include theatrical dialogue with dramatic pauses (*...*)
2. Change lighting to match the mood (dramatic/eerie for intense scenes)
3. Use mood: "eerie" or "intense" for dramatic moments
4. Make dialogue emotional and expressive
5. For summoning/creation: darken lights first, then spotlight on the new character
6. For weather changes: describe the atmosphere dramatically
7. NEVER return plain/boring responses

Examples:
User: "Create a dragon"
Response: {"action":"spawn","character":{"name":"Dragon","type":"dragon","emotion":"angry"},"environment":"castle","lighting":{"intensity":0.4,"color":"#ff4444","mood":"dramatic"},"mood":"intense","dialogue":"*thunderous roar shakes the stage* WHO DARES SUMMON THE MIGHTY DRAGON?! The flames of my wrath shall consume all!"}

User: "Make it nighttime"
Response: {"action":"environment","environment":"nighttime","lighting":{"intensity":0.2,"color":"#2a1a4e","mood":"mysterious"},"mood":"eerie","dialogue":"*the stage darkens as moonlight creeps through the clouds* The night has fallen... and with it, secrets awaken..."}

User: "Add storm effects"
Response: {"action":"weather","weather":"storm","lighting":{"intensity":0.3,"color":"#4a4a5a","mood":"dramatic"},"mood":"intense","dialogue":"*lightning tears across the sky* The heavens rage! Hold fast, for the storm shows no mercy!"}`;

const STATIC_FALLBACKS: Record<string, string> = {
  dragon: JSON.stringify({
    action: "spawn",
    character: { name: "Dragon", type: "dragon", emotion: "angry" },
    environment: "castle",
    lighting: { intensity: 0.4, color: "#ff4444", mood: "dramatic" },
    mood: "intense",
    dialogue: "*thunderous roar shakes the stage* WHO DARES SUMMON THE MIGHTY DRAGON?! The flames of my wrath shall consume all!",
  }),
  night: JSON.stringify({
    action: "environment",
    environment: "nighttime",
    lighting: { intensity: 0.2, color: "#2a1a4e", mood: "mysterious" },
    mood: "eerie",
    dialogue: "*the stage darkens as moonlight creeps through the clouds* The night has fallen... and with it, secrets awaken...",
  }),
  storm: JSON.stringify({
    action: "weather",
    weather: "storm",
    lighting: { intensity: 0.3, color: "#4a4a5a", mood: "dramatic" },
    mood: "intense",
    dialogue: "*lightning tears across the sky* The heavens rage! Hold fast, for the storm shows no mercy!",
  }),
  lion: JSON.stringify({
    action: "spawn",
    character: { name: "Lion", type: "lion", emotion: "angry" },
    environment: "desert",
    lighting: { intensity: 0.5, color: "#f59e0b", mood: "dramatic" },
    mood: "intense",
    dialogue: "*A low, primal vibration shakes the very floorboards... then a deafening ROAR* Behold! The sands part for the King of Beasts!",
  }),
  panda: JSON.stringify({
    action: "spawn",
    character: { name: "Panda", type: "panda", emotion: "happy" },
    environment: "forest",
    lighting: { intensity: 0.6, color: "#22c55e", mood: "bright" },
    dialogue: "*munches on bamboo happily* Oh hello there! Would you like some bamboo? It's delicious!",
  }),
  king: JSON.stringify({
    action: "spawn",
    character: { name: "King", type: "king", emotion: "angry" },
    lighting: { intensity: 0.5, color: "#fbbf24", mood: "dramatic" },
    mood: "intense",
    dialogue: "*crown gleams under dramatic spotlight* I am the ruler of this realm! Speak your purpose, mortal!",
  }),
  wizard: JSON.stringify({
    action: "spawn",
    character: { name: "Wizard", type: "wizard", emotion: "surprised" },
    lighting: { intensity: 0.4, color: "#7c3aed", mood: "mysterious" },
    mood: "eerie",
    dialogue: "*purple sparks crackle from the staff* Ahhh... a visitor in my domain. What magic brings you here?",
  }),
  pirate: JSON.stringify({
    action: "spawn",
    character: { name: "Pirate", type: "pirate", emotion: "happy" },
    environment: "pirate-ship",
    lighting: { intensity: 0.6, color: "#f5f5dc", mood: "bright" },
    dialogue: "*swings from the rigging* Arrr! Welcome aboard, matey! The seas be calm today!",
  }),
  castle: JSON.stringify({
    action: "environment",
    environment: "castle",
    lighting: { intensity: 0.7, color: "#fbbf24", mood: "bright" },
    dialogue: "*the grand castle gates creak open* Welcome to the royal court! What brings you to our kingdom?",
  }),
  ship: JSON.stringify({
    action: "environment",
    environment: "pirate-ship",
    lighting: { intensity: 0.6, color: "#f5f5dc", mood: "bright" },
    dialogue: "*sails billow in the wind* All hands on deck! The pirate ship sets sail!",
  }),
};

function getStaticFallback(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  for (const [key, response] of Object.entries(STATIC_FALLBACKS)) {
    if (lower.includes(key)) return response;
  }
  return null;
}

export async function generateSceneResponse(prompt: string): Promise<string> {
  const fallback = getStaticFallback(prompt);
  if (fallback) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${SYSTEM_PROMPT}\n\nUser Request: ${prompt}`,
    });

    const text = response.text || "";
    return cleanJsonResponse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);
    
    if (error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      return JSON.stringify({
        action: "dialogue",
        dialogue: "*the stage goes quiet* The director is catching their breath... try again in a moment!",
      });
    }
    
    return JSON.stringify({
      action: "dialogue",
      dialogue: "*confused murmurs from the stage* I didn't quite catch that. Could you try again?",
    });
  }
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json\s*/g, "");
  cleaned = cleaned.replace(/```\s*/g, "");
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return cleaned;
}
