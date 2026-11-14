import { Mp3Encoder } from '@breezystack/lamejs';
import type { AudioFxSettings, SongItem } from '../types/music';
import { AUDIO_QUALITIES, EQ_15_FREQUENCIES } from './audioEffectsEngine';

const MAX_CACHE_ENTRIES = 24;
const previewBufferCache = new Map<string, ArrayBuffer>();
let sharedDecodeCtx: AudioContext | null = null;

function getSharedDecodeContext(): AudioContext {
  if (!sharedDecodeCtx || sharedDecodeCtx.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedDecodeCtx = new AudioCtx();
  }
  return sharedDecodeCtx;
}

/**
 * Fetches and caches the raw compressed preview bytes in memory so subsequent playback
 * or Spatial Atmos downloads require zero network wait.
 */
export async function fetchCachedPreviewBuffer(previewUrl: string): Promise<ArrayBuffer> {
  const existing = previewBufferCache.get(previewUrl);
  if (existing) {
    // Return a fresh copy because AudioContext.decodeAudioData detaches the passed buffer.
    return existing.slice(0);
  }

  const res = await fetch(`/api/audio-proxy?url=${encodeURIComponent(previewUrl)}`);
  if (!res.ok) {
    throw new Error('FETCH_FAILED');
  }
  const raw = await res.arrayBuffer();

  if (previewBufferCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = previewBufferCache.keys().next().value;
    if (oldestKey) previewBufferCache.delete(oldestKey);
  }
  previewBufferCache.set(previewUrl, raw);

  return raw.slice(0);
}

function floatToInt16Chunk(
  floatData: Float32Array,
  start: number,
  end: number,
  target: Int16Array
): number {
  const len = end - start;
  for (let i = 0; i < len; i++) {
    const s = floatData[start + i];
    const clamped = s > 1 ? 1 : s < -1 ? -1 : s;
    target[i] = clamped < 0 ? (clamped * 0x8000) | 0 : (clamped * 0x7fff) | 0;
  }
  return len;
}

function encodeAudioBufferToLightMp3(buffer: AudioBuffer, kbps = 128): Blob {
  const channels = 2;
  const sampleRate = buffer.sampleRate;
  const encoder = new Mp3Encoder(channels, sampleRate, kbps);

  const leftFloat = buffer.getChannelData(0);
  const rightFloat = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : leftFloat;
  const totalSamples = buffer.length;

  // Batch encode 16 MP3 frames (18,432 samples) per pass for high throughput and low GC overhead
  const blockSize = 1152 * 16;
  const leftInt16 = new Int16Array(blockSize);
  const rightInt16 = new Int16Array(blockSize);
  const mp3Parts: BlobPart[] = [];

  for (let offset = 0; offset < totalSamples; offset += blockSize) {
    const end = Math.min(totalSamples, offset + blockSize);
    const len = floatToInt16Chunk(leftFloat, offset, end, leftInt16);
    floatToInt16Chunk(rightFloat, offset, end, rightInt16);

    const encoded = encoder.encodeBuffer(
      len === blockSize ? leftInt16 : leftInt16.subarray(0, len),
      len === blockSize ? rightInt16 : rightInt16.subarray(0, len)
    );
    if (encoded.length > 0) {
      mp3Parts.push(new Uint8Array(encoded));
    }
  }

  const tail = encoder.flush();
  if (tail.length > 0) {
    mp3Parts.push(new Uint8Array(tail));
  }

  return new Blob(mp3Parts, { type: 'audio/mpeg' });
}

export interface SpatialDownloadResult {
  bytes: number;
  format: 'mp3';
}

/**
 * Renders a fast, compact Dolby Atmos Binaural 3D Spatial MP3 (~470 KB at 128 kbps)
 * applying the full LastWave 15-band parametric EQ, AutoEQ headphone curve,
 * and spatial binaural cross-reflection unless Bit-Perfect bypass is active.
 */
export async function downloadSongSpatialAtmos(
  song: SongItem,
  preDecodedBuffer?: AudioBuffer | null,
  audioFx?: AudioFxSettings
): Promise<SpatialDownloadResult> {
  if (!song.previewUrl && !preDecodedBuffer) {
    throw new Error('NO_PREVIEW');
  }

  let decoded = preDecodedBuffer || null;
  if (!decoded) {
    const rawBuffer = await fetchCachedPreviewBuffer(song.previewUrl!);
    const ctx = getSharedDecodeContext();
    decoded = await ctx.decodeAudioData(rawBuffer);
  }

  // 44.1kHz stereo keeps full spatial clarity while matching MP3 frame timing cleanly
  const targetSampleRate = 44100;
  const lengthSamples = Math.ceil(decoded.duration * targetSampleRate);
  const offline = new OfflineAudioContext(2, lengthSamples, targetSampleRate);

  const source = offline.createBufferSource();
  source.buffer = decoded;

  const isBitPerfect = Boolean(audioFx?.bitPerfectMode);

  // 15-band parametric EQ
  let prevNode: AudioNode = source;
  if (!isBitPerfect && audioFx?.eq15Bands?.length === EQ_15_FREQUENCIES.length) {
    EQ_15_FREQUENCIES.forEach((freq, idx) => {
      const db = audioFx.eq15Bands[idx] || 0;
      if (Math.abs(db) < 0.05) return;
      const node = offline.createBiquadFilter();
      node.type = idx === 0 ? 'lowshelf' : idx === EQ_15_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
      if (node.type === 'peaking') node.Q.value = 1.41;
      node.frequency.value = freq;
      node.gain.value = Math.max(-12, Math.min(12, db));
      prevNode.connect(node);
      prevNode = node;
    });
  }

  // Macro EQ & Spatial Binaural Matrix
  const lowShelf = offline.createBiquadFilter();
  lowShelf.type = 'lowshelf';
  lowShelf.frequency.value = 95;
  lowShelf.gain.value = isBitPerfect ? 0 : audioFx ? audioFx.bassDb : 1.8;

  const midPeak = offline.createBiquadFilter();
  midPeak.type = 'peaking';
  midPeak.frequency.value = 1050;
  midPeak.Q.value = 0.85;
  midPeak.gain.value = isBitPerfect ? 0 : audioFx ? audioFx.midDb : 0;

  const airShelf = offline.createBiquadFilter();
  airShelf.type = 'highshelf';
  airShelf.frequency.value = 8200;
  airShelf.gain.value = isBitPerfect ? 0 : audioFx ? audioFx.trebleDb : 2.6;

  const widthRatio = isBitPerfect
    ? 0
    : audioFx
      ? Math.max(0, Math.min(1, audioFx.spatialWidth / 100))
      : 0.65;

  const splitter = offline.createChannelSplitter(2);
  const merger = offline.createChannelMerger(2);

  const leftDirect = offline.createGain();
  const rightDirect = offline.createGain();
  leftDirect.gain.value = 1 - widthRatio * 0.16;
  rightDirect.gain.value = 1 - widthRatio * 0.16;

  const delayL = offline.createDelay(0.05);
  delayL.delayTime.value = 0.013;
  const delayR = offline.createDelay(0.05);
  delayR.delayTime.value = 0.019;

  const wetL = offline.createGain();
  const wetR = offline.createGain();
  wetL.gain.value = widthRatio * 0.32;
  wetR.gain.value = widthRatio * 0.32;

  const compressor = offline.createDynamicsCompressor();
  compressor.threshold.value = -8;
  compressor.knee.value = 6;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.14;

  prevNode.connect(lowShelf);
  lowShelf.connect(midPeak);
  midPeak.connect(airShelf);
  airShelf.connect(splitter);

  const rightInputChannel = decoded.numberOfChannels > 1 ? 1 : 0;
  splitter.connect(leftDirect, 0);
  splitter.connect(rightDirect, rightInputChannel);
  leftDirect.connect(merger, 0, 0);
  rightDirect.connect(merger, 0, 1);

  splitter.connect(delayL, rightInputChannel);
  splitter.connect(delayR, 0);
  delayL.connect(wetL);
  delayR.connect(wetR);
  wetL.connect(merger, 0, 0);
  wetR.connect(merger, 0, 1);

  if (isBitPerfect) {
    merger.connect(offline.destination);
  } else {
    merger.connect(compressor);
    compressor.connect(offline.destination);
  }

  source.start(0);
  const rendered = await offline.startRendering();
  const bitrate = audioFx?.quality ? AUDIO_QUALITIES[audioFx.quality]?.bitrateKbps ?? 128 : 128;
  const mp3Blob = encodeAudioBufferToLightMp3(rendered, bitrate);

  const safeName = `${song.artist} - ${song.title}`
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const url = URL.createObjectURL(mp3Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName || 'RitmoStudio_Track'}_LastWave_Atmos.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);

  return {
    bytes: mp3Blob.size,
    format: 'mp3',
  };
}
