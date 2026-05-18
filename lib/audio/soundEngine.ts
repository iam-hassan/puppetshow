class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) {
      if (this.ctx?.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.ctx.resume();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);

      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.initialized = true;
      console.log('[SoundEngine] Initialized, state:', this.ctx.state);
    } catch (e) {
      console.error('[SoundEngine] Init failed:', e);
    }
  }

  private ensureCtx() {
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  playSwoosh() {
    if (!this.ensureCtx() || !this.noiseBuffer) return;
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, this.ctx!.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx!.currentTime + 0.15);
    filter.Q.value = 0.5;
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.2);
    source.connect(filter).connect(gain).connect(this.masterGain!);
    source.start();
    source.stop(this.ctx!.currentTime + 0.2);
  }

  playThunder() {
    if (!this.ensureCtx() || !this.noiseBuffer) return;
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.9, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 1.5);
    source.connect(filter).connect(gain).connect(this.masterGain!);
    source.start();
    source.stop(this.ctx!.currentTime + 1.5);
  }

  playSparkle() {
    if (!this.ensureCtx()) return;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      const baseFreq = 1200 + Math.random() * 800;
      const t = this.ctx!.currentTime + i * 0.06;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, t + 0.12);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  }

  playJump() {
    if (!this.ensureCtx()) return;
    const osc = this.ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx!.currentTime + 0.15);
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.25);
    osc.connect(gain).connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.25);
  }

  playLanding() {
    if (!this.ensureCtx()) return;
    const osc = this.ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx!.currentTime + 0.12);
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.6, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.15);
    osc.connect(gain).connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.15);
  }

  playCurtain() {
    if (!this.ensureCtx() || !this.noiseBuffer) return;
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.3;
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.5);
    source.connect(filter).connect(gain).connect(this.masterGain!);
    source.start();
    source.stop(this.ctx!.currentTime + 0.5);
  }

  playMagicBurst() {
    if (!this.ensureCtx()) return;
    for (let i = 0; i < 5; i++) {
      const osc = this.ctx!.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      const t = this.ctx!.currentTime + i * 0.04;
      osc.frequency.setValueAtTime(400 + i * 200, t);
      osc.frequency.exponentialRampToValueAtTime(800 + i * 300, t + 0.2);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.3);
    }
  }

  startAmbient() {
    if (!this.ensureCtx() || this.ambientOsc) return;
    this.ambientOsc = this.ctx!.createOscillator();
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.value = 55;
    this.ambientGain = this.ctx!.createGain();
    this.ambientGain.gain.value = 0.05;
    this.ambientOsc.connect(this.ambientGain).connect(this.masterGain!);
    this.ambientOsc.start();
  }

  stopAmbient() {
    if (this.ambientOsc) {
      try { this.ambientOsc.stop(); } catch {}
      this.ambientOsc = null;
      this.ambientGain = null;
    }
  }

  playApplause() {
    if (!this.ensureCtx() || !this.noiseBuffer) return;
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.2;
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 2);
    source.connect(filter).connect(gain).connect(this.masterGain!);
    source.start();
    source.stop(this.ctx!.currentTime + 2);
  }

  playStomp() {
    if (!this.ensureCtx()) return;
    const osc = this.ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx!.currentTime + 0.2);
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.8, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.25);
    osc.connect(gain).connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.25);

    const osc2 = this.ctx!.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(120, this.ctx!.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(40, this.ctx!.currentTime + 0.15);
    const gain2 = this.ctx!.createGain();
    gain2.gain.setValueAtTime(0.4, this.ctx!.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.18);
    osc2.connect(gain2).connect(this.masterGain!);
    osc2.start();
    osc2.stop(this.ctx!.currentTime + 0.18);
  }

  playMagicCast() {
    if (!this.ensureCtx()) return;
    for (let i = 0; i < 6; i++) {
      const osc = this.ctx!.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      const t = this.ctx!.currentTime + i * 0.08;
      osc.frequency.setValueAtTime(600 + i * 150, t);
      osc.frequency.exponentialRampToValueAtTime(1200 + i * 200, t + 0.15);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  }

  /** Metallic sword clash sound */
  playSwordClash() {
    if (!this.ensureCtx()) return;
    // Sharp metallic hit
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      const t = this.ctx!.currentTime + i * 0.015;
      const freq = 2000 + i * 500;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, t + 0.15);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.2);
    }
    // Impact thud
    if (this.noiseBuffer) {
      const source = this.ctx!.createBufferSource();
      source.buffer = this.noiseBuffer;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3000;
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.1);
      source.connect(filter).connect(gain).connect(this.masterGain!);
      source.start();
      source.stop(this.ctx!.currentTime + 0.1);
    }
  }

  /** Dramatic impact for battle moments */
  playDramaticImpact() {
    if (!this.ensureCtx()) return;
    // Deep boom
    const osc = this.ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx!.currentTime + 0.5);
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.7, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.6);
    osc.connect(gain).connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.6);
    // Reverb tail with noise
    if (this.noiseBuffer) {
      const source = this.ctx!.createBufferSource();
      source.buffer = this.noiseBuffer;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      const ng = this.ctx!.createGain();
      ng.gain.setValueAtTime(0.3, this.ctx!.currentTime + 0.05);
      ng.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.8);
      source.connect(filter).connect(ng).connect(this.masterGain!);
      source.start();
      source.stop(this.ctx!.currentTime + 0.8);
    }
  }

  /** Orchestral fanfare for show intro */
  playFanfare() {
    if (!this.ensureCtx()) return;
    const notes = [262, 330, 392, 523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = i < 3 ? 'triangle' : 'sine';
      const t = this.ctx!.currentTime + i * 0.15;
      osc.frequency.setValueAtTime(freq, t);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  /** Lion roar sound */
  playRoar() {
    if (!this.ensureCtx() || !this.noiseBuffer) return;
    // Deep oscillator growl
    const osc = this.ctx!.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx!.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx!.currentTime + 0.8);
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx!.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, this.ctx!.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 1.0);
    osc.connect(gain).connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 1.0);
    // Noise layer for texture
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 300;
    filter.Q.value = 0.5;
    const ng = this.ctx!.createGain();
    ng.gain.setValueAtTime(0.01, this.ctx!.currentTime);
    ng.gain.linearRampToValueAtTime(0.2, this.ctx!.currentTime + 0.15);
    ng.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.8);
    source.connect(filter).connect(ng).connect(this.masterGain!);
    source.start();
    source.stop(this.ctx!.currentTime + 0.8);
  }

  /** Victory fanfare */
  playVictory() {
    if (!this.ensureCtx()) return;
    const melody = [523, 659, 784, 1047, 784, 1047];
    melody.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      const t = this.ctx!.currentTime + i * 0.2;
      osc.frequency.setValueAtTime(freq, t);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\*[^*]+\*/g, '').trim();
      if (!cleanText) { resolve(); return; }
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  setWeatherAmbience(weather: string) {
    if (!this.ensureCtx() || !this.ambientGain || !this.ambientOsc) return;
    switch (weather) {
      case 'storm':
        this.ambientGain.gain.linearRampToValueAtTime(0.06, this.ctx!.currentTime + 1);
        this.ambientOsc.frequency.linearRampToValueAtTime(35, this.ctx!.currentTime + 1);
        break;
      case 'rain':
        this.ambientGain.gain.linearRampToValueAtTime(0.04, this.ctx!.currentTime + 1);
        this.ambientOsc.frequency.linearRampToValueAtTime(65, this.ctx!.currentTime + 1);
        break;
      case 'nighttime':
        this.ambientGain.gain.linearRampToValueAtTime(0.025, this.ctx!.currentTime + 1);
        this.ambientOsc.frequency.linearRampToValueAtTime(50, this.ctx!.currentTime + 1);
        break;
      default:
        this.ambientGain.gain.linearRampToValueAtTime(0.02, this.ctx!.currentTime + 1);
        this.ambientOsc.frequency.linearRampToValueAtTime(55, this.ctx!.currentTime + 1);
    }
  }
}

export const soundEngine = new SoundEngine();
