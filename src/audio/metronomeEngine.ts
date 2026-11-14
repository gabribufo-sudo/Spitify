import type { ClickSound, Subdivision } from '../types/music';

export interface BeatTickEvent {
  beatIndex: number; // 0-based beat in bar (0 .. beatsPerBar - 1)
  subIndex: number; // 0-based subdivision within beat
  isAccent: boolean;
  scheduledTime: number;
}

export interface TempoAnalysisResult {
  bpm: number;
  firstBeatOffsetSec: number;
  confidence: number;
}

export function parseBeatsPerBar(timeSignature: string): number {
  const top = Number(timeSignature.split('/')[0]);
  if (Number.isFinite(top) && top >= 2 && top <= 12) return top;
  return 4;
}

export function analyzeAudioBufferTempo(buffer: AudioBuffer): TempoAnalysisResult {
  const sampleRate = buffer.sampleRate;
  const channelData = buffer.getChannelData(0);
  const hopSec = 0.01; // 10ms resolution (100 Hz envelope)
  const hopSamples = Math.max(1, Math.floor(sampleRate * hopSec));
  const frameCount = Math.floor(channelData.length / hopSamples);

  if (frameCount < 100) {
    return { bpm: 120, firstBeatOffsetSec: 0, confidence: 0 };
  }

  // Compute short-time RMS energy
  const energy = new Float32Array(frameCount);
  for (let i = 0; i < frameCount; i++) {
    let sum = 0;
    const start = i * hopSamples;
    const end = Math.min(channelData.length, start + hopSamples);
    for (let j = start; j < end; j++) {
      const s = channelData[j];
      sum += s * s;
    }
    energy[i] = Math.sqrt(sum / (end - start));
  }

  // Half-wave rectified onset strength
  const onset = new Float32Array(frameCount);
  let meanOnset = 0;
  for (let i = 1; i < frameCount; i++) {
    const diff = energy[i] - energy[i - 1];
    onset[i] = diff > 0 ? diff : 0;
    meanOnset += onset[i];
  }
  meanOnset /= frameCount;

  // Normalize onset peaks above mean
  for (let i = 0; i < frameCount; i++) {
    onset[i] = Math.max(0, onset[i] - meanOnset * 0.65);
  }

  // Evaluate candidate BPMs from 68 to 180 BPM
  let bestBpm = 120;
  let bestScore = -1;
  let secondScore = -1;

  for (let bpm = 68; bpm <= 180; bpm++) {
    const beatPeriodFrames = 60 / bpm / hopSec;
    let score = 0;
    const maxLag = Math.min(frameCount - 1, Math.floor(beatPeriodFrames * 16));
    for (let step = 1; step <= 16; step++) {
      const lag = Math.round(beatPeriodFrames * step);
      if (lag >= maxLag) break;
      let corr = 0;
      const limit = frameCount - lag;
      for (let i = 0; i < limit; i++) {
        corr += onset[i] * onset[i + lag];
      }
      const weight = step % 4 === 0 ? 1.25 : 1.0;
      score += (corr / limit) * weight;
    }
    // Slight perceptual prior toward 90-140 BPM to avoid half/double-time errors
    const prior = bpm >= 88 && bpm <= 142 ? 1.08 : 0.96;
    const weightedScore = score * prior;
    if (weightedScore > bestScore) {
      secondScore = bestScore;
      bestScore = weightedScore;
      bestBpm = bpm;
    } else if (weightedScore > secondScore) {
      secondScore = weightedScore;
    }
  }

  // Find best phase offset (first beat within the first beat period)
  const beatFrames = 60 / bestBpm / hopSec;
  const searchFrames = Math.max(1, Math.floor(beatFrames));
  let bestOffsetFrame = 0;
  let bestPhaseEnergy = -1;

  for (let offset = 0; offset < searchFrames; offset++) {
    let phaseSum = 0;
    let count = 0;
    for (let pos = offset; pos < frameCount; pos += beatFrames) {
      const idx = Math.round(pos);
      if (idx < frameCount) {
        phaseSum += onset[idx];
        // Include +/-1 frame neighborhood (10ms)
        if (idx > 0) phaseSum += onset[idx - 1] * 0.5;
        if (idx + 1 < frameCount) phaseSum += onset[idx + 1] * 0.5;
        count++;
      }
    }
    const avg = count > 0 ? phaseSum / count : 0;
    if (avg > bestPhaseEnergy) {
      bestPhaseEnergy = avg;
      bestOffsetFrame = offset;
    }
  }

  const confidence =
    bestScore > 0 && secondScore >= 0
      ? Math.min(1, Math.max(0.25, (bestScore - secondScore) / (bestScore + 1e-6) + 0.45))
      : 0.4;

  return {
    bpm: bestBpm,
    firstBeatOffsetSec: bestOffsetFrame * hopSec,
    confidence: Number(confidence.toFixed(2)),
  };
}

export class MetronomeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;
  private bpm = 120;
  private beatsPerBar = 4;
  private subdivision: Subdivision = 1;
  private sound: ClickSound = 'wood';
  private accentBeatOne = true;
  private volume = 0.75;

  private currentBeat = 0;
  private currentSub = 0;
  private nextNoteTime = 0;
  private lookaheadMs = 25;
  private scheduleAheadSec = 0.11;
  private timerId: number | null = null;
  private pendingUiTimers: number[] = [];

  private onTickCallback: ((event: BeatTickEvent) => void) | null = null;

  public ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setOnTick(cb: ((event: BeatTickEvent) => void) | null): void {
    this.onTickCallback = cb;
  }

  public setBpm(bpm: number): void {
    const clamped = Math.min(260, Math.max(30, Math.round(bpm)));
    this.bpm = clamped;
  }

  public setTimeSignature(ts: string): void {
    this.beatsPerBar = parseBeatsPerBar(ts);
    if (this.currentBeat >= this.beatsPerBar) {
      this.currentBeat = 0;
    }
  }

  public setSubdivision(sub: Subdivision): void {
    this.subdivision = sub;
    if (this.currentSub >= sub) {
      this.currentSub = 0;
    }
  }

  public setSound(sound: ClickSound): void {
    this.sound = sound;
  }

  public setAccentBeatOne(enabled: boolean): void {
    this.accentBeatOne = enabled;
  }

  public setVolume(vol: number): void {
    this.volume = Math.min(1, Math.max(0, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.015);
    }
  }

  public nudgePhase(deltaMs: number): void {
    if (!this.isRunning) return;
    this.nextNoteTime += deltaMs / 1000;
  }

  public alignToAnchor(anchorCtxTime: number): void {
    const ctx = this.ensureContext();
    const stepSec = 60 / this.bpm / this.subdivision;
    const now = ctx.currentTime;
    let t = anchorCtxTime;
    while (t < now + 0.02) {
      t += stepSec * this.subdivision * this.beatsPerBar;
    }
    this.currentBeat = 0;
    this.currentSub = 0;
    this.nextNoteTime = t;
  }

  public start(anchorCtxTime?: number): void {
    const ctx = this.ensureContext();
    if (this.isRunning) {
      if (anchorCtxTime !== undefined) {
        this.alignToAnchor(anchorCtxTime);
      }
      return;
    }

    this.isRunning = true;
    this.currentBeat = 0;
    this.currentSub = 0;

    if (anchorCtxTime !== undefined) {
      this.alignToAnchor(anchorCtxTime);
    } else {
      this.nextNoteTime = ctx.currentTime + 0.04;
    }

    this.timerId = window.setInterval(() => this.scheduler(), this.lookaheadMs);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    for (const id of this.pendingUiTimers) {
      window.clearTimeout(id);
    }
    this.pendingUiTimers = [];
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private scheduler(): void {
    if (!this.ctx || !this.isRunning) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadSec) {
      this.scheduleNote(this.currentBeat, this.currentSub, this.nextNoteTime);
      this.advanceStep();
    }
  }

  private advanceStep(): void {
    const secondsPerBeat = 60.0 / this.bpm;
    const stepDuration = secondsPerBeat / this.subdivision;
    this.nextNoteTime += stepDuration;

    this.currentSub++;
    if (this.currentSub >= this.subdivision) {
      this.currentSub = 0;
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
    }
  }

  private scheduleNote(beatIndex: number, subIndex: number, time: number): void {
    if (!this.ctx || !this.masterGain) return;

    const isDownbeat = beatIndex === 0 && subIndex === 0;
    const isMainBeat = subIndex === 0;
    const isAccent = isDownbeat && this.accentBeatOne;

    this.triggerClickSound(time, isAccent, isMainBeat);

    const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1000);
    const uiTimer = window.setTimeout(() => {
      if (!this.isRunning) return;
      this.onTickCallback?.({
        beatIndex,
        subIndex,
        isAccent,
        scheduledTime: time,
      });
    }, delayMs);
    this.pendingUiTimers.push(uiTimer);
    if (this.pendingUiTimers.length > 64) {
      this.pendingUiTimers.shift();
    }
  }

  private triggerClickSound(time: number, isAccent: boolean, isMainBeat: boolean): void {
    if (!this.ctx || !this.masterGain) return;

    if (this.sound === 'digital') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1560 : isMainBeat ? 1040 : 720, time);
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(isAccent ? 0.9 : isMainBeat ? 0.55 : 0.25, time + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.05);
      return;
    }

    if (this.sound === 'rimshot') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const baseFreq = isAccent ? 460 : isMainBeat ? 340 : 250;
      osc.frequency.setValueAtTime(baseFreq * 1.8, time);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, time + 0.015);
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(isAccent ? 0.85 : isMainBeat ? 0.55 : 0.22, time + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.045);
      return;
    }

    // Default: 'wood' warm clave-style percussive click
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isAccent ? 1180 : isMainBeat ? 840 : 620, time);
    osc.frequency.exponentialRampToValueAtTime(isAccent ? 780 : 540, time + 0.025);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isAccent ? 1400 : 950, time);
    filter.Q.setValueAtTime(2.4, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(isAccent ? 1.0 : isMainBeat ? 0.68 : 0.3, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.06);
  }
}
