import type { EnvironmentType, WeatherType, PuppetAction } from '@/types';

export interface StoryBeat {
  act: number;
  title: string;
  narration: string;
  environment?: EnvironmentType;
  weather?: WeatherType;
  lighting?: {
    intensity: number;
    color: string;
    mood: 'bright' | 'dim' | 'dramatic' | 'mysterious';
  };
  spawnCharacter?: {
    name: string;
    type: 'king' | 'knight' | 'wizard' | 'dragon' | 'pirate' | 'lion' | 'panda' | 'enemy' | 'custom';
    emotion: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
    position: { x: number; y: number; z: number };
  };
  removeCharacter?: string;
  characterActions?: {
    characterName: string;
    action: PuppetAction;
    emotion?: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
    moveTo?: { x: number; y: number; z: number };
  }[];
  playerAction?: PuppetAction;
  playerEmotion?: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
  playerMoveTo?: { x: number; y: number; z: number };
  sound?: 'thunder' | 'magic' | 'curtain' | 'applause' | 'swordClash' | 'impact' | 'fanfare' | 'roar' | 'victory';
  dialogue?: {
    speaker: string;
    text: string;
    emotion: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
  };
  duration: number;
  startBattle?: boolean;
}

export const storyScript: StoryBeat[] = [
  // ===== ACT 1: THE GOLDEN KINGDOM — INTRODUCTIONS =====
  {
    act: 1,
    title: 'The Golden Kingdom',
    narration: '',
    environment: 'castle',
    weather: 'clear',
    lighting: { intensity: 0.9, color: '#fbbf24', mood: 'bright' },
    spawnCharacter: {
      name: 'King Aldric',
      type: 'king',
      emotion: 'happy',
      position: { x: -1.8, y: 0, z: 2.5 },
    },
    dialogue: {
      speaker: 'Narrator',
      text: 'In the heart of a golden kingdom, a wise king ruled with strength and kindness...',
      emotion: 'neutral',
    },
    sound: 'fanfare',
    duration: 5000,
  },
  {
    act: 1,
    title: 'The Golden Kingdom',
    narration: '',
    spawnCharacter: {
      name: 'Leo the Lion',
      type: 'lion',
      emotion: 'happy',
      position: { x: 2.5, y: 0, z: 2.5 },
    },
    characterActions: [
      { characterName: 'King Aldric', action: 'salute', emotion: 'happy' },
    ],
    dialogue: {
      speaker: 'Narrator',
      text: 'Beside him stood Leo the Lion, guardian of the realm — wise and fearless.',
      emotion: 'neutral',
    },
    sound: 'magic',
    duration: 5000,
  },
  {
    act: 1,
    title: 'The Golden Kingdom',
    narration: '',
    playerMoveTo: { x: 0, y: 0, z: 3 },
    playerAction: 'bow',
    playerEmotion: 'neutral',
    characterActions: [
      { characterName: 'King Aldric', action: 'walkCenter', emotion: 'happy', moveTo: { x: -1.2, y: 0, z: 2.8 } },
      { characterName: 'Leo the Lion', action: 'walkCenter', emotion: 'happy', moveTo: { x: 1.2, y: 0, z: 2.8 } },
    ],
    dialogue: {
      speaker: 'King Aldric',
      text: 'Welcome, brave hero! Our kingdom has known peace for many years, thanks to the courage of those who protect it.',
      emotion: 'happy',
    },
    duration: 7000,
  },

  // ===== ACT 2: THE WARNING — KING AND LION DIALOGUE =====
  {
    act: 2,
    title: 'The Warning',
    narration: '',
    lighting: { intensity: 0.7, color: '#f59e0b', mood: 'bright' },
    characterActions: [
      { characterName: 'Leo the Lion', action: 'walkCenter', emotion: 'neutral', moveTo: { x: 1.5, y: 0, z: 2.5 } },
    ],
    dialogue: {
      speaker: 'Leo the Lion',
      text: 'My King... I sense something stirring in the darkness beyond the mountains. A shadow grows.',
      emotion: 'neutral',
    },
    duration: 6500,
  },
  {
    act: 2,
    title: 'The Warning',
    narration: '',
    characterActions: [
      { characterName: 'King Aldric', action: 'walkCenter', emotion: 'sad', moveTo: { x: -1.8, y: 0, z: 2.5 } },
      { characterName: 'Leo the Lion', action: 'idle', emotion: 'neutral' },
    ],
    dialogue: {
      speaker: 'King Aldric',
      text: 'Surely our borders are secure? The kingdom has stood for a thousand years.',
      emotion: 'sad',
    },
    duration: 5500,
  },
  {
    act: 2,
    title: 'The Warning',
    narration: '',
    weather: 'fog',
    lighting: { intensity: 0.5, color: '#9ca3af', mood: 'mysterious' },
    characterActions: [
      { characterName: 'Leo the Lion', action: 'walkCenter', emotion: 'angry', moveTo: { x: 1.2, y: 0, z: 2.2 } },
      { characterName: 'King Aldric', action: 'idle', emotion: 'surprised' },
    ],
    dialogue: {
      speaker: 'Leo the Lion',
      text: 'I have watched the eastern skies for three moons. The creatures of shadow grow bold. Mark my words, my King — danger approaches.',
      emotion: 'angry',
    },
    sound: 'thunder',
    duration: 7000,
  },
  {
    act: 2,
    title: 'The Warning',
    narration: '',
    lighting: { intensity: 0.4, color: '#7c3aed', mood: 'mysterious' },
    characterActions: [
      { characterName: 'King Aldric', action: 'walkCenter', emotion: 'angry', moveTo: { x: -1.5, y: 0, z: 2.8 } },
      { characterName: 'Leo the Lion', action: 'idle', emotion: 'neutral' },
    ],
    dialogue: {
      speaker: 'King Aldric',
      text: 'Then we shall face it together. Hero — we may need your courage soon. Be ready.',
      emotion: 'angry',
    },
    playerAction: 'salute',
    playerEmotion: 'neutral',
    duration: 5500,
  },

  // ===== ACT 3: THE DARK CREATURE APPEARS =====
  {
    act: 3,
    title: 'The Dark Creature',
    narration: '',
    environment: 'nighttime',
    weather: 'storm',
    lighting: { intensity: 0.25, color: '#dc2626', mood: 'dramatic' },
    spawnCharacter: {
      name: 'Shadow Beast',
      type: 'enemy',
      emotion: 'angry',
      position: { x: 0.5, y: 0, z: 1.2 },
    },
    sound: 'impact',
    duration: 2500,
  },
  {
    act: 3,
    title: 'The Dark Creature',
    narration: '',
    playerEmotion: 'surprised',
    characterActions: [
      { characterName: 'King Aldric', action: 'idle', emotion: 'surprised', moveTo: { x: -1.5, y: 0, z: 2.5 } },
      { characterName: 'Leo the Lion', action: 'idle', emotion: 'surprised', moveTo: { x: 1.5, y: 0, z: 2.5 } },
      { characterName: 'Shadow Beast', action: 'roar', emotion: 'angry' },
    ],
    dialogue: {
      speaker: 'King Aldric',
      text: 'By the ancients... He was right! Hero — we need your help! Only you can stop this creature!',
      emotion: 'surprised',
    },
    sound: 'roar',
    duration: 6000,
  },
  {
    act: 3,
    title: 'The Dark Creature',
    narration: '',
    playerAction: 'heroicStance',
    playerEmotion: 'angry',
    playerMoveTo: { x: -0.6, y: 0, z: 1.8 },
    characterActions: [
      { characterName: 'Leo the Lion', action: 'salute', emotion: 'angry' },
      { characterName: 'King Aldric', action: 'defend', emotion: 'angry' },
      { characterName: 'Shadow Beast', action: 'attack', emotion: 'angry', moveTo: { x: 0.3, y: 0, z: 1 } },
    ],
    dialogue: {
      speaker: 'Narrator',
      text: 'A shadow fell across the land... a fearsome creature emerged from the darkness!',
      emotion: 'angry',
    },
    sound: 'thunder',
    duration: 5000,
    startBattle: true,
  },

  // ===== ACT 5: VICTORY (after interactive battle) =====
  {
    act: 5,
    title: 'Victory',
    narration: '',
    environment: 'castle',
    weather: 'clear',
    lighting: { intensity: 1.0, color: '#fbbf24', mood: 'bright' },
    playerAction: 'celebrate',
    playerEmotion: 'happy',
    characterActions: [
      { characterName: 'King Aldric', action: 'celebrate', emotion: 'happy', moveTo: { x: -1.5, y: 0, z: 2.8 } },
      { characterName: 'Leo the Lion', action: 'idle', emotion: 'happy', moveTo: { x: 1.5, y: 0, z: 2.8 } },
    ],
    dialogue: {
      speaker: 'King Aldric',
      text: 'You have saved the kingdom, brave hero! The shadow is vanquished!',
      emotion: 'happy',
    },
    sound: 'fanfare',
    duration: 5000,
  },
  {
    act: 5,
    title: 'Victory',
    narration: '',
    playerAction: 'theaterBow',
    playerEmotion: 'happy',
    characterActions: [
      { characterName: 'Leo the Lion', action: 'salute', emotion: 'happy' },
    ],
    duration: 3000,
  },

  // ===== ACT 6: THE END =====
  {
    act: 6,
    title: 'The End',
    narration: '',
    lighting: { intensity: 0.7, color: '#fbbf24', mood: 'bright' },
    playerAction: 'theaterBow',
    playerEmotion: 'happy',
    playerMoveTo: { x: 0, y: 0, z: 3.2 },
    characterActions: [
      { characterName: 'King Aldric', action: 'theaterBow', emotion: 'happy', moveTo: { x: -1.5, y: 0, z: 3.2 } },
      { characterName: 'Leo the Lion', action: 'theaterBow', emotion: 'happy', moveTo: { x: 1.5, y: 0, z: 3.2 } },
    ],
    dialogue: {
      speaker: 'Narrator',
      text: 'And so the kingdom was saved. The King, the Lion, and the Hero stood together as legends.',
      emotion: 'happy',
    },
    sound: 'applause',
    duration: 6000,
  },
];

export function getStoryBeat(index: number): StoryBeat | null {
  if (index < 0 || index >= storyScript.length) return null;
  return storyScript[index];
}

export function getStoryDuration(): number {
  return storyScript.reduce((sum, beat) => sum + beat.duration, 0);
}
