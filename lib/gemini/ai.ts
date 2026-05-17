import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
});

const SYSTEM_PROMPT = `You are an AI stage director for a virtual puppet theater.
Convert user requests into structured JSON scene instructions.
Return ONLY valid JSON with no markdown formatting or extra text.

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
  "dialogue": "string (optional - character dialogue line)",
  "character": {
    "name": "string",
    "type": "string",
    "emotion": "string"
  },
  "prop": {
    "type": "string",
    "color": "string"
  },
  "mood": "string (optional)",
  "lighting": {
    "intensity": 0-1,
    "color": "hex color",
    "mood": "string"
  }
}

Examples:
User: "Create a dragon"
Response: {"action":"spawn","character":{"name":"Dragon","type":"dragon","emotion":"angry"},"dialogue":"*roars loudly* Who dares enter my domain!"}

User: "Make it nighttime"
Response: {"action":"environment","environment":"nighttime","lighting":{"intensity":0.3,"color":"#4a3b8c","mood":"mysterious"},"mood":"eerie"}

User: "Add storm effects"
Response: {"action":"weather","weather":"storm","lighting":{"intensity":0.4,"color":"#6b7280","mood":"dramatic"},"mood":"intense"}

User: "Make the king angry"
Response: {"action":"update","target":"king","character":{"name":"King","type":"king","emotion":"angry"},"dialogue":"How dare you! Guards, seize this intruder!"}`;

export async function generateSceneResponse(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${SYSTEM_PROMPT}\n\nUser Request: ${prompt}`,
    });

    const text = response.text || '';
    return cleanJsonResponse(text);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return JSON.stringify({
      action: 'dialogue',
      dialogue: "I'm having trouble understanding. Could you try again?",
    });
  }
}

export async function generateDialogue(
  character: string,
  emotion: string,
  context: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a single line of dialogue for a puppet character.
Character: ${character}
Emotion: ${emotion}
Context: ${context}

Return ONLY the dialogue text, nothing else.`,
    });

    return response.text || '...';
  } catch (error) {
    console.error('Dialogue Generation Error:', error);
    return '...';
  }
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  cleaned = cleaned.replace(/```json\s*/g, '');
  cleaned = cleaned.replace(/```\s*/g, '');

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return cleaned;
}
