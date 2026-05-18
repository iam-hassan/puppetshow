import { create } from 'zustand';
import type {
  SceneState,
  Character,
  Prop,
  DialogueEntry,
  PuppetState,
  PuppetAction,
  EnvironmentType,
  WeatherType,
  AIResponse,
  ShowPhase,
  BattlePhase,
  GestureType,
} from '@/types';
import { soundEngine } from '@/lib/audio/soundEngine';

interface AppState {
  scene: SceneState;
  puppet: PuppetState;
  isHandTracking: boolean;
  currentGesture: string;
  aiProcessing: boolean;
  showWebcam: boolean;
  hideCameraFeed: boolean;
  isPerformanceMode: boolean;
  showPhase: ShowPhase;
  curtainsOpen: boolean;
  showTitle: string;
  showSubtitle: string;

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
  setPuppetAction: (action: PuppetAction) => void;

  setIsHandTracking: (tracking: boolean) => void;
  setCurrentGesture: (gesture: string) => void;
  setAiProcessing: (processing: boolean) => void;
  setShowWebcam: (show: boolean) => void;
  setHideCameraFeed: (hide: boolean) => void;
  setPerformanceMode: (mode: boolean) => void;
  battlePhase: BattlePhase;
  requiredGesture: GestureType | null;
  beastHealth: number;
  battleTimer: number;
  battleHitCount: number;
  battleMessage: string;
  isBattlePaused: boolean;
  showGesturePrompt: boolean;

  setBattlePhase: (phase: BattlePhase) => void;
  setRequiredGesture: (gesture: GestureType | null) => void;
  setBeastHealth: (health: number) => void;
  setBattleTimer: (timer: number) => void;
  setBattleHitCount: (count: number) => void;
  setBattleMessage: (msg: string) => void;
  setIsBattlePaused: (paused: boolean) => void;
  setShowGesturePrompt: (show: boolean) => void;

  setShowPhase: (phase: ShowPhase) => void;
  setCurtainsOpen: (open: boolean) => void;
  setShowTitle: (title: string) => void;
  setShowSubtitle: (subtitle: string) => void;

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
  position: { x: 0, y: 0, z: 3 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1.2,
  emotion: 'neutral',
  isGrabbing: false,
  action: 'idle',
};

export const useStore = create<AppState>((set) => ({
  scene: initialScene,
  puppet: initialPuppet,
  isHandTracking: false,
  currentGesture: 'none',
  aiProcessing: false,
  showWebcam: true,
  hideCameraFeed: false,
  isPerformanceMode: false,
  showPhase: 'idle',
  curtainsOpen: true,
  showTitle: '',
  showSubtitle: '',
  battlePhase: 'idle',
  requiredGesture: null,
  beastHealth: 5,
  battleTimer: 0,
  battleHitCount: 0,
  battleMessage: '',
  isBattlePaused: false,
  showGesturePrompt: false,

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

  setPuppetAction: (action) =>
    set((state) => ({
      puppet: { ...state.puppet, action },
    })),

  setIsHandTracking: (tracking) => set({ isHandTracking: tracking }),
  setCurrentGesture: (gesture) => set({ currentGesture: gesture }),
  setAiProcessing: (processing) => set({ aiProcessing: processing }),
  setShowWebcam: (show) => set({ showWebcam: show }),
  setHideCameraFeed: (hide) => set({ hideCameraFeed: hide }),
  setPerformanceMode: (mode) => set({ isPerformanceMode: mode }),
  setBattlePhase: (phase) => set({ battlePhase: phase }),
  setRequiredGesture: (gesture) => set({ requiredGesture: gesture }),
  setBeastHealth: (health) => set({ beastHealth: health }),
  setBattleTimer: (timer) => set({ battleTimer: timer }),
  setBattleHitCount: (count) => set({ battleHitCount: count }),
  setBattleMessage: (msg) => set({ battleMessage: msg }),
  setIsBattlePaused: (paused) => set({ isBattlePaused: paused }),
  setShowGesturePrompt: (show) => set({ showGesturePrompt: show }),
  setShowPhase: (phase) => set({ showPhase: phase }),
  setCurtainsOpen: (open) => set({ curtainsOpen: open }),
  setShowTitle: (title) => set({ showTitle: title }),
  setShowSubtitle: (subtitle) => set({ showSubtitle: subtitle }),

  applyAIResponse: (response) =>
    set((state) => {
      const newScene = { ...state.scene };

      if (response.environment) {
        newScene.environment = response.environment;
        newScene.sceneTransition = true;
        soundEngine.playCurtain();
      }

      if (response.weather) {
        newScene.weather = response.weather;
        if (response.weather === 'storm') soundEngine.playThunder();
        soundEngine.setWeatherAmbience(response.weather);
      }

      if (response.lighting) {
        newScene.lighting = { ...newScene.lighting, ...response.lighting };
      }

      if (response.mood) {
        newScene.stageMood = response.mood;
        if (response.mood === 'intense' || response.mood === 'eerie') {
          soundEngine.playThunder();
        }
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
        soundEngine.speak(response.dialogue);
      }

      if (response.character && response.action === 'spawn') {
        const newCharacter: Character = {
          id: Date.now().toString(),
          name: response.character.name,
          type: response.character.type,
          position: { x: (Math.random() - 0.5) * 2.5, y: 0, z: 2.5 },
          color: '#8b5cf6',
          emotion: response.character.emotion,
          dialogue: response.dialogue || '',
        };
        newScene.characters = [...newScene.characters, newCharacter];
        soundEngine.playMagicBurst();
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
      showPhase: 'idle',
      curtainsOpen: true,
      showTitle: '',
      showSubtitle: '',
      battlePhase: 'idle',
      requiredGesture: null,
      beastHealth: 5,
      battleTimer: 0,
      battleHitCount: 0,
      battleMessage: '',
      isBattlePaused: false,
      showGesturePrompt: false,
    }),
}));
