'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useState } from 'react';
import { generateSceneResponse } from '@/lib/gemini/ai';
import type { AIResponse } from '@/types';

const QUICK_ACTIONS = [
  { label: 'Create Dragon', command: 'Create a dragon' },
  { label: 'Nighttime', command: 'Make it nighttime' },
  { label: 'Storm Mode', command: 'Add storm effects' },
  { label: 'Spawn Castle', command: 'Spawn a castle' },
  { label: 'Pirate Ship', command: 'Spawn pirate ship' },
  { label: 'King Angry', command: 'Make the king angry' },
];

export function ControlPanel() {
  const { scene, aiProcessing, showWebcam, setShowWebcam } = useStore();
  const { isListening, transcript, startListening, stopListening, error } =
    useVoiceRecognition();
  const [textInput, setTextInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleQuickAction = async (command: string) => {
    try {
      const responseText = await generateSceneResponse(command);
      const response: AIResponse = JSON.parse(responseText);
      useStore.getState().applyAIResponse(response);

      if (response.dialogue) {
        useStore.getState().addDialogue({
          id: Date.now().toString(),
          characterId: response.character?.name || 'narrator',
          characterName: response.character?.name || 'Narrator',
          text: response.dialogue,
          emotion: response.character?.emotion || 'neutral',
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error('Failed to process action:', err);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    await handleQuickAction(textInput);
    setTextInput('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 left-4 z-20 space-y-3"
    >
      <div className="bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10 overflow-hidden">
        <div className="p-3 border-b border-purple-500/20">
          <h3 className="text-purple-200 text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            Voice Control
          </h3>
        </div>

        <div className="p-3 space-y-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isListening
                ? 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30'
                : 'bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-red-400 animate-pulse' : 'bg-purple-400'
              }`}
            />
            {isListening ? 'Listening...' : 'Start Voice'}
          </button>

          {transcript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/60 bg-white/5 rounded-lg p-2"
            >
              &ldquo;{transcript}&rdquo;
            </motion.div>
          )}

          {aiProcessing && (
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              AI Processing...
            </div>
          )}

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10 overflow-hidden">
        <div className="p-3 border-b border-purple-500/20">
          <h3 className="text-purple-200 text-sm font-semibold">Quick Actions</h3>
        </div>

        <div className="p-3">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-full py-2 px-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-500/20 transition-colors"
          >
            {showQuickActions ? 'Hide Actions' : 'Show Actions'}
          </button>

          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.command)}
                    disabled={aiProcessing}
                    className="w-full py-1.5 px-3 rounded-lg bg-white/5 text-white/70 text-xs hover:bg-purple-500/20 hover:text-purple-200 transition-all disabled:opacity-50 text-left"
                  >
                    {action.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10 overflow-hidden">
        <div className="p-3 border-b border-purple-500/20">
          <h3 className="text-purple-200 text-sm font-semibold">Text Command</h3>
        </div>

        <form onSubmit={handleTextSubmit} className="p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type a command..."
              className="flex-1 bg-white/5 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
              disabled={aiProcessing}
            />
            <button
              type="submit"
              disabled={aiProcessing || !textInput.trim()}
              className="px-4 py-2 bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-200 text-sm hover:bg-purple-500/40 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10 overflow-hidden">
        <div className="p-3">
          <button
            onClick={() => setShowWebcam(!showWebcam)}
            className="w-full py-2 px-3 rounded-lg bg-white/5 text-white/70 text-xs hover:bg-purple-500/20 transition-colors"
          >
            {showWebcam ? 'Hide Webcam' : 'Show Webcam'}
          </button>
        </div>
      </div>

      <div className="bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10 p-3">
        <div className="text-xs text-white/50 space-y-1">
          <p className="text-purple-300 font-medium">Current Scene</p>
          <p>Environment: <span className="text-white/70 capitalize">{scene.environment.replace('-', ' ')}</span></p>
          <p>Weather: <span className="text-white/70 capitalize">{scene.weather}</span></p>
          <p>Mood: <span className="text-white/70 capitalize">{scene.stageMood}</span></p>
          <p>Characters: <span className="text-white/70">{scene.characters.length}</span></p>
        </div>
      </div>
    </motion.div>
  );
}
