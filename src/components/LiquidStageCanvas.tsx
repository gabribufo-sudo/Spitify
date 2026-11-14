import { useEffect, useRef, useState } from 'react';
import { Cast, Maximize2, Minimize2, Play, Pause, AudioWaveform } from 'lucide-react';
import type { AudioEffectsChain } from '../audio/audioEffectsEngine';
import type { ArtworkPalette, SongItem, VisualSettings } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

interface LiquidStageCanvasProps {
  effectsChain: AudioEffectsChain;
  visualSettings: VisualSettings;
  palette: ArtworkPalette;
  activeSong: SongItem | null;
  bpm: number;
  timeSignature: string;
  isTrackPlaying: boolean;
  isMetronomePlaying: boolean;
  currentBeatIndex: number;
  castConnected: boolean;
  fullscreenLabel: string;
  exitFullscreenLabel: string;
  noTrackLabel: string;
  castBtnLabel: string;
  playLabel: string;
  pauseLabel: string;
  qualityBadge: string;
  onToggleTrackPlay: () => void;
  onCastClick: () => void;
}

export function LiquidStageCanvas({
  effectsChain,
  visualSettings,
  palette,
  activeSong,
  bpm,
  timeSignature,
  isTrackPlaying,
  isMetronomePlaying,
  currentBeatIndex,
  castConnected,
  fullscreenLabel,
  exitFullscreenLabel,
  noTrackLabel,
  castBtnLabel,
  playLabel,
  pauseLabel,
  qualityBadge,
  onToggleTrackPlay,
  onCastClick,
}: LiquidStageCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beatPulseRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isMetronomePlaying || isTrackPlaying) {
      beatPulseRef.current = 1;
    }
  }, [currentBeatIndex, isMetronomePlaying, isTrackPlaying]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let phase = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const targetW = Math.max(300, Math.floor(rect.width * dpr));
      const targetH = Math.max(200, Math.floor(rect.height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      const audio = effectsChain.sampleAudioLevels();
      beatPulseRef.current *= 0.88;
      const pulse = beatPulseRef.current;

      const motionScale = prefersReducedMotion ? 0.15 : visualSettings.motionIntensity / 100;
      const energy = isTrackPlaying
        ? Math.max(audio.overall, pulse * 0.45)
        : isMetronomePlaying
          ? pulse * 0.55
          : 0.12;

      const speed = (0.012 + energy * 0.045) * (0.35 + motionScale);
      phase += speed;

      // LastWave Obsidian Forest stage backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0E100C');
      bgGrad.addColorStop(0.55, '#151812');
      bgGrad.addColorStop(1, '#0B0D09');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const accent = visualSettings.customAccentHex || palette.primary || '#C6F100';
      const sec = palette.secondary || '#536716';
      const glow = palette.glow || '#C6F100';

      // Ambient refractive liquid halos
      const cx = w * 0.5;
      const cy = h * 0.5;
      const blobRadius = Math.min(w, h) * (0.38 + audio.bass * 0.16 + pulse * 0.06);

      const orb1X = cx + Math.cos(phase * 0.8) * (w * 0.18 * motionScale);
      const orb1Y = cy + Math.sin(phase * 0.65) * (h * 0.14 * motionScale);
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, blobRadius);
      grad1.addColorStop(0, `${accent}48`);
      grad1.addColorStop(0.6, `${accent}18`);
      grad1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      const orb2X = cx + Math.sin(phase * 0.55 + 1.4) * (w * 0.22 * motionScale);
      const orb2Y = cy + Math.cos(phase * 0.7 + 0.9) * (h * 0.16 * motionScale);
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, blobRadius * 1.15);
      grad2.addColorStop(0, `${sec}55`);
      grad2.addColorStop(0.65, `${glow}1a`);
      grad2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      // Subtle LastWave concentric orbit hairlines
      ctx.save();
      ctx.strokeStyle = 'rgba(201, 228, 166, 0.12)';
      ctx.lineWidth = 1 * dpr;
      const orbitBase = Math.min(w, h) * 0.34;
      [0.82, 1.0, 1.18].forEach((m) => {
        ctx.beginPath();
        ctx.arc(cx, cy, orbitBase * m, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();

      if (visualSettings.visualizer === 'liquid-waves') {
        const layers = 4;
        for (let l = 0; l < layers; l++) {
          ctx.beginPath();
          const baseY = h * (0.52 + l * 0.08);
          const amp = (14 + energy * 44 + l * 6) * dpr * (0.4 + motionScale * 0.8);
          ctx.moveTo(0, h);
          const steps = 48;
          for (let s = 0; s <= steps; s++) {
            const ratio = s / steps;
            const binVal =
              audio.bins[Math.min(audio.bins.length - 1, Math.floor(ratio * 42))] / 255;
            const x = ratio * w;
            const waveOffset =
              Math.sin(ratio * 5.2 + phase * (1 + l * 0.25) + l * 1.1) * amp +
              Math.cos(ratio * 9.5 - phase * 1.3) * (binVal * 26 * dpr * motionScale);
            ctx.lineTo(x, baseY + waveOffset);
          }
          ctx.lineTo(w, h);
          ctx.closePath();

          const waveGrad = ctx.createLinearGradient(0, baseY - amp, 0, h);
          waveGrad.addColorStop(0, l % 2 === 0 ? `${accent}44` : `${sec}44`);
          waveGrad.addColorStop(1, 'rgba(14,16,12,0.14)');
          ctx.fillStyle = waveGrad;
          ctx.fill();

          ctx.strokeStyle = l === 0 ? `${glow}bb` : 'rgba(238,241,230,0.16)';
          ctx.lineWidth = (l === 0 ? 1.8 : 1) * dpr;
          ctx.stroke();
        }
      } else if (visualSettings.visualizer === 'orbital-glass') {
        const rings = 5;
        const maxR = Math.min(w, h) * 0.4;
        for (let r = 1; r <= rings; r++) {
          const binIdx = r * 8;
          const freqAmp = (audio.bins[binIdx] || 0) / 255;
          const radius =
            maxR * (r / rings) * (0.88 + freqAmp * 0.24 + pulse * 0.08) +
            Math.sin(phase * 1.4 + r) * 5 * dpr * motionScale;

          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(12, radius), 0, Math.PI * 2);
          ctx.strokeStyle = r % 2 === 0 ? `${accent}90` : 'rgba(238,241,230,0.22)';
          ctx.lineWidth = (1.5 + freqAmp * 2.5) * dpr;
          ctx.stroke();

          const nodeAngle = phase * (r % 2 === 0 ? 1 : -0.75) + r * 1.3;
          const nx = cx + Math.cos(nodeAngle) * radius;
          const ny = cy + Math.sin(nodeAngle) * radius;
          ctx.beginPath();
          ctx.arc(nx, ny, (4 + freqAmp * 6) * dpr, 0, Math.PI * 2);
          ctx.fillStyle = r % 2 === 0 ? glow : '#EEF1E6';
          ctx.fill();
        }
      } else if (visualSettings.visualizer === 'spectrum-silk') {
        const barCount = 44;
        const gap = w / (barCount + 4);
        const startX = gap * 2;
        for (let i = 0; i < barCount; i++) {
          const bin =
            audio.bins[Math.min(audio.bins.length - 1, Math.floor((i / barCount) * 64))] / 255;
          const idleWave = (Math.sin(phase * 1.8 + i * 0.28) * 0.5 + 0.5) * (0.14 + pulse * 0.22);
          const norm = Math.max(bin, idleWave);
          const barH = Math.max(6 * dpr, norm * h * 0.56);
          const x = startX + i * gap;
          const y = cy - barH * 0.5;

          const barGrad = ctx.createLinearGradient(x, y, x, y + barH);
          barGrad.addColorStop(0, glow);
          barGrad.addColorStop(0.5, accent);
          barGrad.addColorStop(1, sec);

          ctx.fillStyle = barGrad;
          const radius = Math.min(gap * 0.34, 5 * dpr);
          ctx.beginPath();
          ctx.roundRect(x, y, Math.max(3 * dpr, gap * 0.52), barH, radius);
          ctx.fill();
        }
      } else {
        const auraR = Math.min(w, h) * (0.28 + audio.bass * 0.14 + pulse * 0.05);
        const auraGrad = ctx.createRadialGradient(cx, cy, auraR * 0.35, cx, cy, auraR * 1.45);
        auraGrad.addColorStop(0, `${glow}88`);
        auraGrad.addColorStop(0.55, `${accent}44`);
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, auraR * 1.45, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [
    effectsChain,
    isMetronomePlaying,
    isTrackPlaying,
    palette.glow,
    palette.primary,
    palette.secondary,
    visualSettings.customAccentHex,
    visualSettings.motionIntensity,
    visualSettings.visualizer,
  ]);

  const handleToggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen denial in restricted frames
    }
  };

  const accentColor = visualSettings.customAccentHex || palette.primary || '#C6F100';

  return (
    <div
      ref={containerRef}
      className={`relative rounded-[22px] overflow-hidden border border-[#2C3027] bg-[#0E100C] ${
        isFullscreen
          ? 'w-screen h-screen rounded-none flex flex-col justify-between p-8'
          : 'h-[320px] sm:h-[360px]'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* LastWave Specular Liquid Glass Overlay */}
      <div
        className="relative z-10 h-full flex flex-col justify-between p-5"
        style={{
          backdropFilter: `blur(${Math.min(18, Math.round(visualSettings.glassBlurPx * 0.35))}px)`,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#161912]/80 border border-[#C9E4A6]/20 text-xs font-mono tabular-nums text-[#EEF1E6]">
            <AudioWaveform className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>
              {bpm} BPM · {timeSignature} · {qualityBadge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCastClick}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                castConnected
                  ? 'bg-[#C6F100] border-[#C6F100] text-[#20251E] font-semibold'
                  : 'bg-[#161912]/80 border-[#C9E4A6]/20 text-[#EEF1E6] hover:border-[#C6F100]'
              }`}
            >
              <Cast className="w-3.5 h-3.5" />
              <span>{castBtnLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => void handleToggleFullscreen()}
              title={isFullscreen ? exitFullscreenLabel : fullscreenLabel}
              className="p-2 rounded-full bg-[#161912]/80 border border-[#C9E4A6]/20 text-[#EEF1E6] hover:border-[#C6F100] transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
          <div className="flex items-center gap-4 min-w-0 bg-[#161912]/75 backdrop-blur-md border border-[#C9E4A6]/20 rounded-2xl p-3.5 max-w-xl shadow-[inset_0_1px_0_rgba(201,228,166,0.16)]">
            {visualSettings.showAlbumInStage && activeSong ? (
              <ArtworkImage
                src={activeSong.artworkUrl}
                alt={activeSong.title}
                fallbackLabel={activeSong.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-white/15"
              />
            ) : null}
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-[#EEF1E6] truncate">
                {activeSong ? activeSong.title : noTrackLabel}
              </p>
              <p className="text-xs sm:text-sm text-[#B8BFAE] truncate mt-0.5">
                {activeSong
                  ? `${activeSong.artist} · ${activeSong.album}`
                  : `${bpm} BPM · ${timeSignature}`}
              </p>
            </div>
          </div>

          {activeSong?.previewUrl ? (
            <button
              type="button"
              onClick={onToggleTrackPlay}
              className="px-5 py-2.5 rounded-full bg-[#C6F100] text-[#20251E] text-xs font-bold flex items-center gap-2 self-start sm:self-end shrink-0 shadow-lg cursor-pointer hover:brightness-95 transition-all"
            >
              {isTrackPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{pauseLabel}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{playLabel}</span>
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
