export interface HandLandmarks {
  landmarks: Landmark[];
  handedness: string;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export type GestureType =
  | 'open-palm'
  | 'closed-fist'
  | 'pinch'
  | 'swipe-left'
  | 'swipe-right'
  | 'none';

export interface GestureResult {
  type: GestureType;
  confidence: number;
  position: { x: number; y: number };
}

export interface PuppetState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  emotion: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
  isGrabbing: boolean;
  targetPosition?: { x: number; y: number; z: number };
}

export interface Prop {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  scale: number;
  color: string;
}

export interface Character {
  id: string;
  name: string;
  type: 'king' | 'knight' | 'wizard' | 'dragon' | 'pirate' | 'custom';
  position: { x: number; y: number; z: number };
  color: string;
  emotion: PuppetState['emotion'];
  dialogue: string;
}

export interface DialogueEntry {
  id: string;
  characterId: string;
  characterName: string;
  text: string;
  emotion: PuppetState['emotion'];
  timestamp: number;
}

export type EnvironmentType =
  | 'castle'
  | 'pirate-ship'
  | 'forest'
  | 'nighttime'
  | 'storm'
  | 'desert'
  | 'underwater';

export type WeatherType = 'clear' | 'rain' | 'storm' | 'snow' | 'fog';

export interface SceneState {
  environment: EnvironmentType;
  weather: WeatherType;
  lighting: {
    intensity: number;
    color: string;
    mood: 'bright' | 'dim' | 'dramatic' | 'mysterious';
  };
  characters: Character[];
  props: Prop[];
  dialogues: DialogueEntry[];
  activeDialogue: DialogueEntry | null;
  stageMood: string;
  sceneTransition: boolean;
}

export interface AIResponse {
  action: string;
  target?: string;
  environment?: EnvironmentType;
  weather?: WeatherType;
  dialogue?: string;
  character?: {
    name: string;
    type: Character['type'];
    emotion: PuppetState['emotion'];
  };
  prop?: {
    type: string;
    color: string;
  };
  mood?: string;
  lighting?: {
    intensity: number;
    color: string;
    mood: SceneState['lighting']['mood'];
  };
}

export interface VoiceCommand {
  text: string;
  confidence: number;
  timestamp: number;
}
