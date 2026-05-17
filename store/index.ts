import { create } from 'zustand';
import type {
  SceneState,
  Character,
  Prop,
  DialogueEntry,
  PuppetState,
  EnvironmentType,
  WeatherType,
  AIResponse,
} from '@/types';

interface AppState {
  scene: SceneState;
  puppet: PuppetState;
  isListening: boolean;
  isHandTracking: boolean;
  currentGesture: string;
  aiProcessing: boolean;
  showWebcam: boolean;

  setEnvironment: (env: EnvironmentType) => void;
  setWeather: (weather: WeatherType) => void;
  setLighting: (lighting: SceneState['lighting']) => void;
  addCharacter: (character: Character) => void;
  removeCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  addProp: (prop: Prop) => void;
  removeProp: (id: string) => void;
  addDialogue: (dialogue: DialogueEntry) => void;
  setActiveDialogue: (dialogue: DialogueEntry | null) => void;
  setStageMood: (mood: string) => void;
  setSceneTransition: (transitioning: boolean) => void;

  updatePuppetPosition: (position: Partial<PuppetState['position']>) => void;
  updatePuppetRotation: (rotation: Partial<PuppetState['rotation']>) => void;
  setPuppetEmotion: (emotion: PuppetState['emotion']) => void;
  setPuppetGrabbing: (grabbing: boolean) => void;
  setPuppetTarget: (target: { x: number; y: number; z: number } | null) => void;

  setIsListening: (listening: boolean) => void;
  setIsHandTracking: (tracking: boolean) => void;
  setCurrentGesture: (gesture: string) => void;
  setAiProcessing: (processing: boolean) => void;
  setShowWebcam: (show: boolean) => void;

  applyAIResponse: (response: AIResponse) => void;
  resetScene: () => void;
}

const initialScene: SceneState = {
  environment: 'castle',
  weather: 'clear',
  lighting: {
    intensity: 0.8,
    color: '#ffffff',
    mood: 'bright',
  },
  characters: [],
  props: [],
  dialogues: [],
  activeDialogue: null,
  stageMood: 'welcoming',
  sceneTransition: false,
};

const initialPuppet: PuppetState = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  emotion: 'neutral',
  isGrabbing: false,
};

export const useStore = create<AppState>((set) => ({
  scene: initialScene,
  puppet: initialPuppet,
  isListening: false,
  isHandTracking: false,
  currentGesture: 'none',
  aiProcessing: false,
  showWebcam: true,

  setEnvironment: (env) =>
    set((state) => ({
      scene: { ...state.scene, environment: env, sceneTransition: true },
    })),

  setWeather: (weather) =>
    set((state) => ({
      scene: { ...state.scene, weather },
    })),

  setLighting: (lighting) =>
    set((state) => ({
      scene: { ...state.scene, lighting },
    })),

  addCharacter: (character) =>
    set((state) => ({
      scene: {
        ...state.scene,
        characters: [...state.scene.characters, character],
      },
    })),

  removeCharacter: (id) =>
    set((state) => ({
      scene: {
        ...state.scene,
        characters: state.scene.characters.filter((c) => c.id !== id),
      },
    })),

  updateCharacter: (id, updates) =>
    set((state) => ({
      scene: {
        ...state.scene,
        characters: state.scene.characters.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    })),

  addProp: (prop) =>
    set((state) => ({
      scene: {
        ...state.scene,
        props: [...state.scene.props, prop],
      },
    })),

  removeProp: (id) =>
    set((state) => ({
      scene: {
        ...state.scene,
        props: state.scene.props.filter((p) => p.id !== id),
      },
    })),

  addDialogue: (dialogue) =>
    set((state) => ({
      scene: {
        ...state.scene,
        dialogues: [...state.scene.dialogues, dialogue],
        activeDialogue: dialogue,
      },
    })),

  setActiveDialogue: (dialogue) =>
    set((state) => ({
      scene: { ...state.scene, activeDialogue: dialogue },
    })),

  setStageMood: (mood) =>
    set((state) => ({
      scene: { ...state.scene, stageMood: mood },
    })),

  setSceneTransition: (transitioning) =>
    set((state) => ({
      scene: { ...state.scene, sceneTransition: transitioning },
    })),

  updatePuppetPosition: (position) =>
    set((state) => ({
      puppet: {
        ...state.puppet,
        position: { ...state.puppet.position, ...position },
      },
    })),

  updatePuppetRotation: (rotation) =>
    set((state) => ({
      puppet: {
        ...state.puppet,
        rotation: { ...state.puppet.rotation, ...rotation },
      },
    })),

  setPuppetEmotion: (emotion) =>
    set((state) => ({
      puppet: { ...state.puppet, emotion },
    })),

  setPuppetGrabbing: (grabbing) =>
    set((state) => ({
      puppet: { ...state.puppet, isGrabbing: grabbing },
    })),

  setPuppetTarget: (target) =>
    set((state) => ({
      puppet: { ...state.puppet, targetPosition: target || undefined },
    })),

  setIsListening: (listening) => set({ isListening: listening }),
  setIsHandTracking: (tracking) => set({ isHandTracking: tracking }),
  setCurrentGesture: (gesture) => set({ currentGesture: gesture }),
  setAiProcessing: (processing) => set({ aiProcessing: processing }),
  setShowWebcam: (show) => set({ showWebcam: show }),

  applyAIResponse: (response) =>
    set((state) => {
      const newScene = { ...state.scene };

      if (response.environment) {
        newScene.environment = response.environment;
        newScene.sceneTransition = true;
      }

      if (response.weather) {
        newScene.weather = response.weather;
      }

      if (response.lighting) {
        newScene.lighting = { ...newScene.lighting, ...response.lighting };
      }

      if (response.mood) {
        newScene.stageMood = response.mood;
      }

      if (response.dialogue) {
        const newDialogue: DialogueEntry = {
          id: Date.now().toString(),
          characterId: response.character?.name || 'narrator',
          characterName: response.character?.name || 'Narrator',
          text: response.dialogue,
          emotion: response.character?.emotion || 'neutral',
          timestamp: Date.now(),
        };
        newScene.dialogues = [...newScene.dialogues, newDialogue];
        newScene.activeDialogue = newDialogue;
      }

      if (response.character && response.action === 'spawn') {
        const newCharacter: Character = {
          id: Date.now().toString(),
          name: response.character.name,
          type: response.character.type,
          position: { x: (Math.random() - 0.5) * 4, y: 0, z: 0 },
          color: '#8b5cf6',
          emotion: response.character.emotion,
          dialogue: response.dialogue || '',
        };
        newScene.characters = [...newScene.characters, newCharacter];
      }

      if (response.prop && response.action === 'spawn') {
        const newProp: Prop = {
          id: Date.now().toString(),
          type: response.prop.type,
          position: { x: (Math.random() - 0.5) * 3, y: 0.5, z: 0 },
          scale: 1,
          color: response.prop.color,
        };
        newScene.props = [...newScene.props, newProp];
      }

      return { scene: newScene };
    }),

  resetScene: () =>
    set({
      scene: initialScene,
      puppet: initialPuppet,
    }),
}));
