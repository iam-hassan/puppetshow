'use client';

import { useStore } from '@/store';
import { useState, useRef, useEffect } from 'react';
import { generateSceneResponse } from '@/lib/gemini/ai';
import { soundEngine } from '@/lib/audio/soundEngine';
import { storyScript } from '@/lib/story/storyScript';
import type { AIResponse, PuppetAction } from '@/types';

export function ControlPanel() {
  const { aiProcessing, showWebcam, setShowWebcam, isPerformanceMode, setPerformanceMode, resetScene, hideCameraFeed } = useStore();
  const showPhase = useStore((s) => s.showPhase);
  const battlePhase = useStore((s) => s.battlePhase);
  const [textInput, setTextInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const showIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(false);
  const battlePendingRef = useRef(false);
  const resumeBeatsRef = useRef<() => void>(() => {});

  const handleAction = async (command: string) => {
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
      console.error('[ControlPanel] Error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    await handleAction(textInput);
    setTextInput('');
  };

  /**
   * Full cinematic show sequence:
   * 1. Dim lights
   * 2. Close curtains
   * 3. Dramatic pause
   * 4. Fanfare music
   * 5. Open curtains to reveal characters
   * 6. Run story beats with choreography
   * 7. End with curtains closing
   */
  const startPerformance = () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    soundEngine.init();
    soundEngine.startAmbient();
    setPerformanceMode(true);
    useStore.getState().setShowPhase('intro');

    // Clear existing characters for clean show start
    const state = useStore.getState();
    state.scene.characters.forEach((c) => state.removeCharacter(c.id));

    try {
      document.documentElement.requestFullscreen();
    } catch {}

    // PHASE 1: Dim lights (1s)
    useStore.getState().setLighting({ intensity: 0.15, color: '#1a0a2e', mood: 'dim' });
    useStore.getState().setShowTitle('');

    // PHASE 2: Close curtains (after 1s)
    setTimeout(() => {
      if (!isRunningRef.current) return;
      useStore.getState().setCurtainsOpen(false);
      useStore.getState().setShowPhase('curtainClose');
      soundEngine.playCurtain();
    }, 1000);

    // PHASE 3: Dramatic pause + music (after 3.5s)
    setTimeout(() => {
      if (!isRunningRef.current) return;
      soundEngine.playFanfare();
      useStore.getState().setShowTitle('The Lion Guardian');
      useStore.getState().setShowSubtitle('A Puppet Theater Performance');
    }, 3500);

    // PHASE 4: Open curtains (after 6s)
    setTimeout(() => {
      if (!isRunningRef.current) return;
      useStore.getState().setCurtainsOpen(true);
      useStore.getState().setShowPhase('curtainOpen');
      soundEngine.playCurtain();
      useStore.getState().setLighting({ intensity: 0.8, color: '#fbbf24', mood: 'bright' });
      useStore.getState().setShowTitle('');
      useStore.getState().setShowSubtitle('');
    }, 6000);

    // PHASE 5: Start story beats (after 8s)
    setTimeout(() => {
      if (!isRunningRef.current) return;
      useStore.getState().setShowPhase('performing');
      runStoryBeats();
    }, 8000);
  };

  const runStoryBeats = () => {
    let idx = 0;

    const runNextBeat = async () => {
      if (!isRunningRef.current) return;
      if (idx >= storyScript.length) {
        finishShow();
        return;
      }

      const beat = storyScript[idx];
      console.log(`[Show] Act ${beat.act}: ${beat.title}`);
      const t0 = Date.now();

      // Environment & lighting
      if (beat.environment) useStore.getState().setEnvironment(beat.environment);
      if (beat.weather) useStore.getState().setWeather(beat.weather);
      if (beat.lighting) useStore.getState().setLighting(beat.lighting);

      // Spawn character
      if (beat.spawnCharacter) {
        useStore.getState().addCharacter({
          id: `show-${beat.spawnCharacter.name}`,
          name: beat.spawnCharacter.name,
          type: beat.spawnCharacter.type,
          position: beat.spawnCharacter.position,
          color: '#8b5cf6',
          emotion: beat.spawnCharacter.emotion,
          dialogue: '',
        });
        soundEngine.playMagicBurst();
      }

      // Remove character
      if (beat.removeCharacter) {
        const chars = useStore.getState().scene.characters;
        const target = chars.find((c) => c.name === beat.removeCharacter);
        if (target) {
          useStore.getState().removeCharacter(target.id);
          soundEngine.playMagicBurst();
        }
      }

      // Character choreography
      if (beat.characterActions) {
        beat.characterActions.forEach((ca) => {
          const chars = useStore.getState().scene.characters;
          const target = chars.find((c) => c.name === ca.characterName);
          if (target) {
            const updates: Record<string, unknown> = { action: ca.action };
            if (ca.emotion) updates.emotion = ca.emotion;
            if (ca.moveTo) updates.position = ca.moveTo;
            useStore.getState().updateCharacter(target.id, updates);
            setTimeout(() => {
              const chars2 = useStore.getState().scene.characters;
              const t2 = chars2.find((c) => c.name === ca.characterName);
              if (t2) useStore.getState().updateCharacter(t2.id, { action: 'idle' });
            }, 1200);
          }
        });
      }

      // Player action + movement
      if (beat.playerAction) {
        useStore.getState().setPuppetAction(beat.playerAction);
        setTimeout(() => {
          if (isRunningRef.current) useStore.getState().setPuppetAction('idle');
        }, 1500);
      }
      if (beat.playerEmotion) useStore.getState().setPuppetEmotion(beat.playerEmotion);
      if (beat.playerMoveTo) useStore.getState().updatePuppetPosition(beat.playerMoveTo);

      // Sound effects
      if (beat.sound) {
        switch (beat.sound) {
          case 'thunder': soundEngine.playThunder(); break;
          case 'magic': soundEngine.playSparkle(); break;
          case 'curtain': soundEngine.playCurtain(); break;
          case 'applause': setTimeout(() => soundEngine.playApplause(), 500); break;
          case 'swordClash': soundEngine.playSwordClash(); break;
          case 'impact': soundEngine.playDramaticImpact(); break;
          case 'fanfare': soundEngine.playFanfare(); break;
          case 'roar': soundEngine.playRoar(); break;
          case 'victory': soundEngine.playVictory(); break;
        }
      }

      // Dialogue — await TTS to finish
      if (beat.dialogue) {
        const entry = {
          id: Date.now().toString(),
          characterId: beat.dialogue.speaker,
          characterName: beat.dialogue.speaker,
          text: beat.dialogue.text,
          emotion: beat.dialogue.emotion,
          timestamp: Date.now(),
        };
        useStore.getState().addDialogue(entry);
        await soundEngine.speak(beat.dialogue.text);
      }

      idx++;

      // Start interactive battle if this beat triggers it
      if (beat.startBattle) {
        battlePendingRef.current = true;
        resumeBeatsRef.current = () => {
          if (!isRunningRef.current) return;
          showIntervalRef.current = setTimeout(runNextBeat, 1500);
        };
        useStore.getState().setBattlePhase('intro');
        useStore.getState().setShowPhase('battle');
        return;
      }

      const elapsed = Date.now() - t0;
      const remaining = Math.max(0, beat.duration - elapsed);
      showIntervalRef.current = setTimeout(runNextBeat, remaining);
    };

    runNextBeat();

    // Enable resume via ref for battle system
    resumeBeatsRef.current = () => {};
  };

  // Resume story beats after interactive battle ends
  useEffect(() => {
    if (battlePhase === 'idle' && battlePendingRef.current && isPerformanceMode) {
      battlePendingRef.current = false;
      resumeBeatsRef.current();
    }
  }, [battlePhase, isPerformanceMode]);

  const finishShow = () => {
    useStore.getState().setShowPhase('ending');
    soundEngine.playApplause();

    // Close curtains after 2s
    setTimeout(() => {
      if (!isRunningRef.current) return;
      useStore.getState().setCurtainsOpen(false);
      soundEngine.playCurtain();
      useStore.getState().setLighting({ intensity: 0.3, color: '#fbbf24', mood: 'dim' });
    }, 2000);

    // Show "The End" title
    setTimeout(() => {
      if (!isRunningRef.current) return;
      useStore.getState().setShowTitle('The End');
      useStore.getState().setShowSubtitle('Thank you for watching');
      useStore.getState().setShowPhase('finished');
    }, 4000);
  };

  const stopPerformance = () => {
    isRunningRef.current = false;
    window.speechSynthesis.cancel();
    setPerformanceMode(false);
    soundEngine.stopAmbient();
    if (showIntervalRef.current) clearTimeout(showIntervalRef.current);
    useStore.getState().setPuppetAction('idle');
    useStore.getState().setCurtainsOpen(true);
    useStore.getState().setShowPhase('idle');
    useStore.getState().setShowTitle('');
    useStore.getState().setShowSubtitle('');
    resetScene();
    try {
      if (document.fullscreenElement) document.exitFullscreen();
    } catch {}
  };

  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (showIntervalRef.current) clearTimeout(showIntervalRef.current);
    };
  }, []);

  // Performance mode UI
  if (isPerformanceMode) {
    return (
      <div className="pointer-events-auto" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
        {/* Show title overlay */}
        {useStore.getState().showTitle && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 90 }}>
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-amber-100 tracking-widest" style={{ textShadow: '0 0 40px rgba(251,191,36,0.5)' }}>
                {useStore.getState().showTitle}
              </h2>
              {useStore.getState().showSubtitle && (
                <p className="text-lg text-amber-300/60 mt-3 tracking-wider">{useStore.getState().showSubtitle}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 pb-6 items-center">
          {showPhase === 'finished' ? (
            <button
              onClick={stopPerformance}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-600/80 to-amber-500/80 backdrop-blur-md border border-amber-400/50 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30"
            >
              Back to Normal
            </button>
          ) : (
            <>
              <button
                onClick={() => useStore.getState().setHideCameraFeed(!useStore.getState().hideCameraFeed)}
                className="px-3 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs hover:bg-white/20 transition-all"
                title="Toggle camera visibility"
              >
                {hideCameraFeed ? '📷 Show Cam' : '🙈 Hide Cam'}
              </button>
              <button
                onClick={stopPerformance}
                className="px-6 py-3 rounded-full bg-red-600/80 backdrop-blur-md border border-red-400/50 text-white text-sm font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="2" width="10" height="10" rx="1" fill="currentColor" />
                </svg>
                Exit Show
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Normal mode UI (no voice section)
  return (
    <div
      className="pointer-events-auto"
      style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 25, width: '200px' }}
    >
      <div className="space-y-2">
        <button
          onClick={startPerformance}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600/50 to-red-600/50 border border-amber-400/40 text-amber-100 text-xs font-semibold hover:from-amber-600/70 hover:to-red-600/70 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Start Show
        </button>

        <div className="bg-black/70 backdrop-blur-md rounded-xl border border-amber-500/30 overflow-hidden">
          <div className="px-3 py-1.5 border-b border-amber-500/20">
            <h3 className="text-amber-200/80 text-xs font-semibold uppercase tracking-wider">Describe</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-2">
            <div className="flex gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="A dragon appears..."
                className="flex-1 bg-white/5 border border-amber-500/20 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50"
                disabled={aiProcessing}
              />
              <button
                type="submit"
                disabled={aiProcessing || !textInput.trim()}
                className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200 text-xs disabled:opacity-30 hover:bg-amber-500/30"
              >
                ✦
              </button>
            </div>
            {aiProcessing && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-3 h-3 border border-amber-400/50 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-amber-300/60">Director thinking...</span>
              </div>
            )}
          </form>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setShowWebcam(!showWebcam)}
            className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs hover:bg-white/10 hover:text-white/60 transition-all"
          >
            {showWebcam ? '🟢 Cam On' : '🔴 Cam Off'}
          </button>
          <button
            onClick={() => useStore.getState().setHideCameraFeed(!useStore.getState().hideCameraFeed)}
            className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs hover:bg-white/10 hover:text-white/60 transition-all"
          >
            {hideCameraFeed ? '📷 Show Feed' : '🙈 Hide Feed'}
          </button>
        </div>
      </div>
    </div>
  );
}
