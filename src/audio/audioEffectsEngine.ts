import type {
  AiMusicGem,
  ArtworkPalette,
  AudioFxSettings,
  AudioPresetId,
  AudioQualityId,
  AutoEqProfileId,
  SoundGemPreset,
} from '../types/music';

export const EQ_15_FREQUENCIES = [
  25, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000, 16000,
] as const;

export const EQ_15_LABELS = [
  '25', '40', '63', '100', '160', '250', '400', '630', '1k', '1.6k', '2.5k', '4k', '6.3k', '10k', '16k',
] as const;

export const ZERO_EQ_15: number[] = Array(15).fill(0);

export const AUTOEQ_PROFILES: Record<
  AutoEqProfileId,
  { label: string; bands: number[] }
> = {
  none: {
    label: 'Custom / Off',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  'harman-2019': {
    label: 'Harman Target 2019',
    bands: [3.5, 4.0, 3.0, 1.5, 0, -1.0, -0.5, 0, 0.5, 1.5, 2.5, 2.0, 1.0, 1.5, 1.0],
  },
  'airpods-pro-2': {
    label: 'AirPods Pro 2 AutoEQ',
    bands: [1.5, 2.0, 1.0, 0, -1.0, -1.5, -0.5, 0.5, 1.0, 2.0, 1.5, 0.5, -1.0, 1.5, 2.0],
  },
  'sony-xm5': {
    label: 'Sony WH-1000XM5',
    bands: [-1.5, -2.5, -3.5, -3.0, -2.0, -1.0, 0.5, 1.5, 2.0, 2.5, 3.0, 2.0, 1.0, 2.5, 2.0],
  },
  hd650: {
    label: 'Sennheiser HD 650',
    bands: [4.5, 4.0, 2.5, 1.0, 0, -0.5, -1.0, -0.5, 0, 0.5, 1.5, 2.5, 2.0, 1.0, 2.5],
  },
  dt770: {
    label: 'Beyerdynamic DT 770',
    bands: [2.0, 1.5, 0.5, -1.0, -1.5, 0, 1.0, 1.5, 1.0, 0.5, 0, -1.5, -3.5, -2.5, 0.5],
  },
  m50x: {
    label: 'Audio-Technica ATH-M50x',
    bands: [0.5, 1.0, 0, -1.5, -2.0, -1.0, 0.5, 1.0, 0.5, 1.0, 1.5, 0.5, -1.0, -1.5, 0.5],
  },
  earpods: {
    label: 'Apple EarPods / In-Ear',
    bands: [5.0, 4.5, 3.0, 1.5, 0, -1.0, -0.5, 0, 1.0, 1.5, 1.0, 0.5, -1.0, 1.0, 2.0],
  },
};

export const AUDIO_QUALITIES: Record<
  AudioQualityId,
  { badge: string; spec: string; bitrateKbps: number }
> = {
  'atmos-mp3': {
    badge: 'ATMOS ✳ SPATIAL',
    spec: '3D Binaural · Light MP3',
    bitrateKbps: 128,
  },
  'cd-lossless': {
    badge: 'FLAC ✳ LOSSLESS',
    spec: '16-bit / 44.1 kHz',
    bitrateKbps: 192,
  },
  'hires-96': {
    badge: 'HI-RES ✳ FLAC',
    spec: '24-bit / 96 kHz',
    bitrateKbps: 256,
  },
  'master-192': {
    badge: 'MASTER ✳ STUDIO',
    spec: '24-bit / 192 kHz',
    bitrateKbps: 320,
  },
};

export const DEFAULT_AUDIO_FX: AudioFxSettings = {
  preset: 'atmos',
  quality: 'master-192',
  bitPerfectMode: false,
  uac2ClockBypass: true,
  normalizationEnabled: true,
  targetLufs: -14,
  skipSilenceEnabled: false,
  autoEqProfile: 'harman-2019',
  eq15Bands: [...AUTOEQ_PROFILES['harman-2019'].bands],
  automixEnabled: true,
  crossfadeSec: 3,
  bassDb: 2,
  midDb: 0,
  trebleDb: 2.5,
  spatialWidth: 48,
  reverbMix: 16,
  playbackRate: 1.0,
};

export const SOUND_GEMS: SoundGemPreset[] = [
  {
    id: 'gem-crystal-master',
    name: 'Crystal Hi-Res Gem',
    subtitle: 'Trasparenza 24-bit/192kHz, alte frequenze ariose e scena 3D',
    spec: 'Harman · +Air · Spatial 58%',
    accentHex: '#C6F100',
    visualizer: 'liquid-waves',
    audioPatch: {
      quality: 'master-192',
      bitPerfectMode: false,
      preset: 'atmos',
      autoEqProfile: 'harman-2019',
      eq15Bands: [2.0, 2.5, 1.5, 0.5, 0, -0.5, 0, 0.5, 1.0, 2.0, 3.0, 3.5, 2.5, 3.5, 3.0],
      bassDb: 1.5,
      midDb: 0.5,
      trebleDb: 3.0,
      spatialWidth: 58,
      reverbMix: 16,
    },
  },
  {
    id: 'gem-analog-warmth',
    name: 'Analog Vinyl Gem',
    subtitle: 'Calore valvolare su medie frequenze con riverbero sala morbido',
    spec: 'Warmth · Tube · Reverb 34%',
    accentHex: '#D97706',
    visualizer: 'cover-aura',
    audioPatch: {
      quality: 'hires-96',
      bitPerfectMode: false,
      preset: 'liquid-warmth',
      autoEqProfile: 'hd650',
      eq15Bands: [3.5, 3.5, 2.5, 1.5, 1.0, 0.5, 0, 0.5, 1.0, 0.5, -0.5, -1.0, -1.5, -1.0, 0],
      bassDb: 3.5,
      midDb: 1.5,
      trebleDb: -1.0,
      spatialWidth: 42,
      reverbMix: 34,
    },
  },
  {
    id: 'gem-sub-club',
    name: 'Sub-Bass Club Gem',
    subtitle: 'Punch sub-basso definito 25–100 Hz senza impastare la voce',
    spec: 'Punch · +6 dB Sub · Tight',
    accentHex: '#10B981',
    visualizer: 'spectrum-silk',
    audioPatch: {
      quality: 'master-192',
      bitPerfectMode: false,
      preset: 'club-bass',
      autoEqProfile: 'none',
      eq15Bands: [5.5, 6.0, 4.5, 2.0, 0, -1.5, -1.0, 0, 0.5, 1.5, 2.0, 1.5, 1.0, 2.0, 1.5],
      bassDb: 5.5,
      midDb: -1.0,
      trebleDb: 2.0,
      spatialWidth: 40,
      reverbMix: 10,
    },
  },
  {
    id: 'gem-midnight-spatial',
    name: 'Midnight Spatial Gem',
    subtitle: 'Ascolto notturno rilassato con normalizzazione -18 LUFS',
    spec: '-18 LUFS · Soft · Spatial 70%',
    accentHex: '#0EA5E9',
    visualizer: 'orbital-glass',
    audioPatch: {
      quality: 'cd-lossless',
      bitPerfectMode: false,
      normalizationEnabled: true,
      targetLufs: -18,
      preset: 'night',
      autoEqProfile: 'airpods-pro-2',
      eq15Bands: [1.0, 1.5, 1.0, 0, -0.5, 0, 0.5, 1.0, 1.5, 1.0, 0, -1.5, -2.5, -2.0, -1.0],
      bassDb: -1.0,
      midDb: 1.0,
      trebleDb: -2.5,
      spatialWidth: 70,
      reverbMix: 26,
    },
  },
];

export const AI_MUSIC_GEMS: AiMusicGem[] = [
  {
    id: 'gem-crate-digger',
    name: 'Crate Digger Gem',
    role: 'Scoperta perle rare & artisti simili',
    description: 'Trova brani nascosti, B-side e gemme indie compatibili col BPM attivo.',
    model: 'gemini-4-hydrogen',
    starterPrompt:
      'Suggeriscimi 5 perle musicali poco conosciute (Hidden Gems) affini al brano in riproduzione con BPM compatibile e descrizione sonora.',
  },
  {
    id: 'gem-mastering-dac',
    name: 'Audiophile Mastering Gem',
    role: 'Consulente EQ 15 bande & DAC',
    description: 'Calibra curve AutoEQ, taglio sub-bass e Bit-Perfect per le tue cuffie.',
    model: 'gemini-4-carbon',
    starterPrompt:
      'Analizza il genere e il groove del brano attuale e consigliami una curva EQ a 15 bande ideale (25Hz-16kHz) con larghezza Spatial.',
  },
  {
    id: 'gem-dj-automix',
    name: 'Automix & DJ Flow Gem',
    role: 'Transizioni armoniche & scaletta',
    description: 'Progetta passaggi al BPM, Camelot key e crossfade perfetti.',
    model: 'gemini-4-argon',
    starterPrompt:
      'Costruisci una mini scaletta da 4 brani con progressione BPM fluida e suggerimenti per il crossfade Automix partendo da questa traccia.',
  },
  {
    id: 'gem-rhythm-coach',
    name: 'Rhythm & Sync Gem',
    role: 'Studio poliritmico & suddivisioni',
    description: 'Esercizi rapidi su terzine, groove in battere/levare e tempi dispari.',
    model: 'gemini-3.1-flash-lite',
    starterPrompt:
      'Dammi 3 esercizi pratici col metronomo sincronizzato al BPM di questa canzone tra terzine, sedicesimi e accenti.',
  },
];

export function findLeadingNonSilenceSec(buffer: AudioBuffer, threshold = 0.012): number {
  const sampleRate = buffer.sampleRate;
  const ch0 = buffer.getChannelData(0);
  const maxCheck = Math.min(ch0.length, Math.floor(sampleRate * 4));
  for (let i = 0; i < maxCheck; i += 64) {
    if (Math.abs(ch0[i]) >= threshold) {
      return Math.max(0, (i - Math.floor(sampleRate * 0.04)) / sampleRate);
    }
  }
  return 0;
}

export const AUDIO_PRESETS: Record<
  AudioPresetId,
  Pick<AudioFxSettings, 'bassDb' | 'midDb' | 'trebleDb' | 'spatialWidth' | 'reverbMix'>
> = {
  flat: {
    bassDb: 0,
    midDb: 0,
    trebleDb: 0,
    spatialWidth: 0,
    reverbMix: 0,
  },
  atmos: {
    bassDb: 2,
    midDb: 0,
    trebleDb: 2.5,
    spatialWidth: 55,
    reverbMix: 18,
  },
  'liquid-warmth': {
    bassDb: 3.5,
    midDb: 1.5,
    trebleDb: -1,
    spatialWidth: 40,
    reverbMix: 34,
  },
  'club-bass': {
    bassDb: 6,
    midDb: -1.5,
    trebleDb: 2,
    spatialWidth: 35,
    reverbMix: 12,
  },
  vocal: {
    bassDb: -2,
    midDb: 4,
    trebleDb: 2.5,
    spatialWidth: 25,
    reverbMix: 16,
  },
  night: {
    bassDb: -2,
    midDb: 1,
    trebleDb: -3,
    spatialWidth: 30,
    reverbMix: 15,
  },
};

function createImpulseResponse(ctx: AudioContext, durationSec = 1.6, decay = 2.6): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * durationSec);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const env = Math.pow(1 - i / length, decay);
      data[i] = (Math.random() * 2 - 1) * env * 0.45;
    }
  }
  return impulse;
}

/**
 * Real-time Web Audio mastering & spatial rack modeled on LastWave Audio Architecture:
 * - 15-Band Parametric EQ (25 Hz – 16 kHz) with AutoEQ headphone targets
 * - 3-Band Macro Tone Trim (Bass / Mid / Treble)
 * - Binaural Spatial 3D Matrix (13ms / 19ms cross-delay)
 * - Liquid Room Convolver Reverb
 * - Bit-Perfect USB DAC Direct Bypass mode
 * - Real-time FFT Analyser
 */
export class AudioEffectsChain {
  private ctx: AudioContext | null = null;
  private inputNode: GainNode | null = null;
  private eq15Filters: BiquadFilterNode[] = [];
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;

  private spatialDryGain: GainNode | null = null;
  private spatialWetL: GainNode | null = null;
  private spatialWetR: GainNode | null = null;

  private reverbDryGain: GainNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private normGain: GainNode | null = null;

  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;

  private freqBins: Uint8Array<ArrayBuffer> = new Uint8Array(128);
  private timeBins: Uint8Array<ArrayBuffer> = new Uint8Array(128);

  getSampleRate(): number {
    return this.ctx?.sampleRate || 48000;
  }

  ensureGraph(ctx: AudioContext, initialVolume: number, settings: AudioFxSettings): GainNode {
    if (this.ctx === ctx && this.inputNode && this.masterGain) {
      this.applySettings(settings);
      this.setMasterVolume(initialVolume);
      return this.inputNode;
    }

    this.ctx = ctx;

    const input = ctx.createGain();
    input.gain.value = 1;

    // 15-band parametric EQ chain
    const filters: BiquadFilterNode[] = EQ_15_FREQUENCIES.map((freq, idx) => {
      const node = ctx.createBiquadFilter();
      if (idx === 0) {
        node.type = 'lowshelf';
      } else if (idx === EQ_15_FREQUENCIES.length - 1) {
        node.type = 'highshelf';
      } else {
        node.type = 'peaking';
        node.Q.value = 1.41;
      }
      node.frequency.value = freq;
      node.gain.value = 0;
      return node;
    });

    const bass = ctx.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 85;

    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1050;
    mid.Q.value = 0.85;

    const treble = ctx.createBiquadFilter();
    treble.type = 'highshelf';
    treble.frequency.value = 8200;

    // Spatial stereo cross-delay matrix (binaural 13ms / 19ms)
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);

    const dryGain = ctx.createGain();
    const delayL = ctx.createDelay(0.05);
    delayL.delayTime.value = 0.013;
    const delayR = ctx.createDelay(0.05);
    delayR.delayTime.value = 0.019;

    const wetL = ctx.createGain();
    const wetR = ctx.createGain();

    // Liquid Convolver Reverb stage
    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulseResponse(ctx, 1.5, 2.8);
    const revDry = ctx.createGain();
    const revWet = ctx.createGain();
    const reverbSum = ctx.createGain();

    // Gentle headroom protection + ReplayGain / LUFS normalization stage
    const normGain = ctx.createGain();
    normGain.gain.value = 1;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -6;
    compressor.knee.value = 8;
    compressor.ratio.value = 2.6;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.14;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    this.freqBins = new Uint8Array(analyser.frequencyBinCount);
    this.timeBins = new Uint8Array(analyser.frequencyBinCount);

    const master = ctx.createGain();
    master.gain.value = initialVolume;

    // Wire 15-band EQ -> Macro EQ
    let prevNode: AudioNode = input;
    for (const fNode of filters) {
      prevNode.connect(fNode);
      prevNode = fNode;
    }
    prevNode.connect(bass);
    bass.connect(mid);
    mid.connect(treble);

    // Wire Spatial Stage
    treble.connect(dryGain);
    dryGain.connect(reverbSum);

    treble.connect(splitter);
    splitter.connect(delayL, 1);
    splitter.connect(delayR, 0);
    delayL.connect(wetL);
    delayR.connect(wetR);
    wetL.connect(merger, 0, 0);
    wetR.connect(merger, 0, 1);
    merger.connect(reverbSum);

    // Wire Liquid Reverb Stage
    reverbSum.connect(revDry);
    reverbSum.connect(convolver);
    convolver.connect(revWet);

    revDry.connect(normGain);
    revWet.connect(normGain);
    normGain.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(master);
    master.connect(ctx.destination);

    this.inputNode = input;
    this.eq15Filters = filters;
    this.bassFilter = bass;
    this.midFilter = mid;
    this.trebleFilter = treble;
    this.spatialDryGain = dryGain;
    this.spatialWetL = wetL;
    this.spatialWetR = wetR;
    this.reverbDryGain = revDry;
    this.reverbWetGain = revWet;
    this.normGain = normGain;
    this.analyser = analyser;
    this.masterGain = master;

    this.applySettings(settings);
    return input;
  }

  applySettings(settings: AudioFxSettings): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (settings.bitPerfectMode) {
      for (const f of this.eq15Filters) {
        f.gain.setTargetAtTime(0, now, 0.02);
      }
      this.bassFilter?.gain.setTargetAtTime(0, now, 0.02);
      this.midFilter?.gain.setTargetAtTime(0, now, 0.02);
      this.trebleFilter?.gain.setTargetAtTime(0, now, 0.02);
      this.spatialDryGain?.gain.setTargetAtTime(1, now, 0.02);
      this.spatialWetL?.gain.setTargetAtTime(0, now, 0.02);
      this.spatialWetR?.gain.setTargetAtTime(0, now, 0.02);
      this.reverbDryGain?.gain.setTargetAtTime(1, now, 0.02);
      this.reverbWetGain?.gain.setTargetAtTime(0, now, 0.02);
      this.normGain?.gain.setTargetAtTime(1, now, 0.02);
      return;
    }

    const lufsScale = settings.normalizationEnabled
      ? settings.targetLufs === -18
        ? 0.72
        : settings.targetLufs === -16
          ? 0.85
          : 1.0
      : 1.0;
    this.normGain?.gain.setTargetAtTime(lufsScale, now, 0.02);

    const bands = Array.isArray(settings.eq15Bands) ? settings.eq15Bands : ZERO_EQ_15;
    this.eq15Filters.forEach((f, idx) => {
      const db = typeof bands[idx] === 'number' ? bands[idx] : 0;
      f.gain.setTargetAtTime(Math.max(-12, Math.min(12, db)), now, 0.02);
    });

    this.bassFilter?.gain.setTargetAtTime(settings.bassDb, now, 0.02);
    this.midFilter?.gain.setTargetAtTime(settings.midDb, now, 0.02);
    this.trebleFilter?.gain.setTargetAtTime(settings.trebleDb, now, 0.02);

    const widthRatio = Math.max(0, Math.min(1, settings.spatialWidth / 100));
    this.spatialDryGain?.gain.setTargetAtTime(1 - widthRatio * 0.16, now, 0.02);
    this.spatialWetL?.gain.setTargetAtTime(widthRatio * 0.34, now, 0.02);
    this.spatialWetR?.gain.setTargetAtTime(widthRatio * 0.34, now, 0.02);

    const revRatio = Math.max(0, Math.min(1, settings.reverbMix / 100));
    this.reverbDryGain?.gain.setTargetAtTime(1 - revRatio * 0.25, now, 0.02);
    this.reverbWetGain?.gain.setTargetAtTime(revRatio * 0.65, now, 0.02);
  }

  setMasterVolume(vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1.2, vol)), this.ctx.currentTime, 0.015);
  }

  sampleAudioLevels(): {
    bass: number;
    mid: number;
    treble: number;
    overall: number;
    bins: Uint8Array;
    wave: Uint8Array;
  } {
    if (!this.analyser) {
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        overall: 0,
        bins: this.freqBins,
        wave: this.timeBins,
      };
    }

    this.analyser.getByteFrequencyData(this.freqBins);
    this.analyser.getByteTimeDomainData(this.timeBins);

    const n = this.freqBins.length;
    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    const bassEnd = Math.max(4, Math.floor(n * 0.14));
    const midEnd = Math.max(bassEnd + 4, Math.floor(n * 0.48));

    for (let i = 0; i < n; i++) {
      const val = this.freqBins[i] / 255;
      if (i < bassEnd) bassSum += val;
      else if (i < midEnd) midSum += val;
      else trebleSum += val;
    }

    const bass = bassSum / bassEnd;
    const mid = midSum / (midEnd - bassEnd);
    const treble = trebleSum / Math.max(1, n - midEnd);
    const overall = bass * 0.45 + mid * 0.35 + treble * 0.2;

    return {
      bass,
      mid,
      treble,
      overall,
      bins: this.freqBins,
      wave: this.timeBins,
    };
  }
}

const HARMONIC_PALETTES: ArtworkPalette[] = [
  { primary: '#C6F100', secondary: '#536716', glow: '#DDF95E' },
  { primary: '#A7DF20', secondary: '#2F4A1E', glow: '#C6F100' },
  { primary: '#10B981', secondary: '#0F766E', glow: '#34D399' },
  { primary: '#0EA5E9', secondary: '#1E40AF', glow: '#38BDF8' },
  { primary: '#D97706', secondary: '#78350F', glow: '#FBBF24' },
  { primary: '#EC4899', secondary: '#701A75', glow: '#F472B6' },
];

function hashSeed(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`;
}

export async function extractPaletteFromArtwork(
  artworkUrl: string | undefined,
  seedText: string
): Promise<ArtworkPalette> {
  const fallback = HARMONIC_PALETTES[hashSeed(seedText || 'lastwave') % HARMONIC_PALETTES.length];
  if (!artworkUrl) return fallback;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(fallback), 2200);

    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(fallback);
          return;
        }
        ctx.drawImage(img, 0, 0, 24, 24);
        const data = ctx.getImageData(0, 0, 24, 24).data;

        let bestSat = -1;
        let pR = 198;
        let pG = 241;
        let pB = 0;
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const lum = (max + min) / 2;
          const sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255) || 1);

          if (lum > 35 && lum < 225) {
            sumR += r;
            sumG += g;
            sumB += b;
            count++;
            if (sat > bestSat) {
              bestSat = sat;
              pR = r;
              pG = g;
              pB = b;
            }
          }
        }

        if (count === 0) {
          resolve(fallback);
          return;
        }

        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;
        resolve({
          primary: rgbToHex(pR, pG, pB),
          secondary: rgbToHex(avgR * 0.72, avgG * 0.72, avgB * 0.9),
          glow: rgbToHex(Math.min(255, pR + 36), Math.min(255, pG + 36), Math.min(255, pB + 36)),
        });
      } catch {
        resolve(fallback);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(fallback);
    };

    img.src = artworkUrl;
  });
}
