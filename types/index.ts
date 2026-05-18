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
  | 'one-finger'
  | 'two-fingers'
  | 'three-fingers'
  | 'four-fingers'
  | 'swipe-left'
  | 'swipe-right'
  | 'swipe-up'
  | 'none';

export interface GestureResult {
  type: GestureType;
  confidence: number;
  position: { x: number; y: number };
}

export type PuppetAction =
  | 'idle'
  | 'jump'
  | 'bow'
  | 'theaterBow'
  | 'shootArrow'
  | 'celebrate'
  | 'wave'
  | 'salute'
  | 'attack'
  | 'defend'
  | 'walkLeft'
  | 'walkRight'
  | 'walkCenter'
  | 'roar'
  | 'heroicStance'
  | 'perform'
  | 'powerStance'
  | 'magicCast'
  | 'slam'
  | 'summon'
  | 'point';

export interface PuppetState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  emotion: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
  isGrabbing: boolean;
  action: PuppetAction;
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
  type: 'king' | 'knight' | 'wizard' | 'dragon' | 'pirate' | 'lion' | 'panda' | 'enemy' | 'custom';
  position: { x: number; y: number; z: number };
  color: string;
  emotion: PuppetState['emotion'];
  dialogue: string;
  action?: PuppetAction;
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

export type ShowPhase =
  | 'idle'
  | 'intro'
  | 'curtainClose'
  | 'curtainOpen'
  | 'performing'
  | 'battle'
  | 'ending'
  | 'finished';

export type BattlePhase = 'idle' | 'intro' | 'active' | 'finisher' | 'victory';

export const GESTURE_ATTACK_MAP: Record<string, { action: PuppetAction; label: string; damage: number }> = {
  'one-finger': { action: 'attack', label: 'Sword Slash', damage: 1 },
  'closed-fist': { action: 'heroicStance', label: 'Heavy Strike', damage: 1 },
  'open-palm': { action: 'defend', label: 'Arcane Shield', damage: 1 },
  'two-fingers': { action: 'shootArrow', label: 'Magic Bolt', damage: 1 },
};
