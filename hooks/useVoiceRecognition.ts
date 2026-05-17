import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import { generateSceneResponse } from '@/lib/gemini/ai';
import type { VoiceCommand, AIResponse } from '@/types';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

export function useVoiceRecognition() {
  const [isListening, setIsListeningLocal] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  const {
    setIsListening,
    setAiProcessing,
    applyAIResponse,
    addDialogue,
  } = useStore();

  const processVoiceCommand = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setAiProcessing(true);

      const newCommand: VoiceCommand = {
        text,
        confidence: 1,
        timestamp: Date.now(),
      };
      setCommands((prev) => [...prev.slice(-9), newCommand]);

      try {
        const responseText = await generateSceneResponse(text);
        const response: AIResponse = JSON.parse(responseText);

        applyAIResponse(response);

        if (response.dialogue) {
          addDialogue({
            id: Date.now().toString(),
            characterId: response.character?.name || 'narrator',
            characterName: response.character?.name || 'Narrator',
            text: response.dialogue,
            emotion: response.character?.emotion || 'neutral',
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        console.error('Failed to process voice command:', err);
      } finally {
        setAiProcessing(false);
      }
    },
    [applyAIResponse, addDialogue, setAiProcessing]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.results.length - 1; i >= 0; i--) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript = result[0].transcript;
            break;
          } else {
            interimTranscript = result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError(`Speech error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      isListeningRef.current = true;
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [processVoiceCommand, setIsListening]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, [setIsListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    commands,
    startListening,
    stopListening,
  };
}
