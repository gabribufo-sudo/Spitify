import {
  Play,
  Square,
  Pause,
  Minus,
  Plus,
  Volume2,
  AudioWaveform,
  RotateCcw,
  Hand,
  Sparkles,
} from 'lucide-react';
import type { ClickSound, SongItem, Subdivision } from '../types/music';
import type { Translations } from '../i18n/translations';
import { parseBeatsPerBar } from '../audio/metronomeEngine';
import { ArtworkImage } from './ArtworkImage';

interface MetronomeHardwareProps {
  t: Translations['metronome'];
  activeSong: SongItem | null;
  bpm: number;
  timeSignature: string;
  subdivision: Subdivision;
  clickSound: ClickSound;
  accentBeatOne: boolean;
  isMetronomePlaying: boolean;
  currentBeatIndex: number;
  isTrackPlaying: boolean;
  isAnalyzingAudio: boolean;
  autoSyncEnabled: boolean;
  metronomeVolume: number;
  trackVolume: number;
  trackProgress: number;
  trackDurationSec: number;
  bpmSourceLabel: string;
  onToggleMetronome: () => void;
  onChangeBpm: (next: number) => void;
  onTapTempo: () => void;
  onChangeTimeSignature: (ts: string) => void;
  onChangeSubdivision: (sub: Subdivision) => void;
  onChangeClickSound: (sound: ClickSound) => void;
  onToggleAccent: () => void;
  onToggleTrackPlay: () => void;
  onToggleAutoSync: () => void;
  onNudgePhase: (deltaMs: number) => void;
  onRealignPhase: () => void;
  onChangeMetronomeVolume: (vol: number) => void;
  onChangeTrackVolume: (vol: number) => void;
  onOpenCoverFromSong?: (song: SongItem) => void;
}

const TIME_SIGNATURES = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8'];

export function MetronomeHardware({
  t,
  activeSong,
  bpm,
  timeSignature,
  subdivision,
  clickSound,
  accentBeatOne,
  isMetronomePlaying,
  currentBeatIndex,
  isTrackPlaying,
  isAnalyzingAudio,
  autoSyncEnabled,
  metronomeVolume,
  trackVolume,
  trackProgress,
  trackDurationSec,
  bpmSourceLabel,
  onToggleMetronome,
  onChangeBpm,
  onTapTempo,
  onChangeTimeSignature,
  onChangeSubdivision,
  onChangeClickSound,
  onToggleAccent,
  onToggleTrackPlay,
  onToggleAutoSync,
  onNudgePhase,
  onRealignPhase,
  onChangeMetronomeVolume,
  onChangeTrackVolume,
  onOpenCoverFromSong,
}: MetronomeHardwareProps) {
  const beatsPerBar = parseBeatsPerBar(timeSignature);
  const beatSteps = Array.from({ length: beatsPerBar }, (_, i) => i);

  const subdivisions: { value: Subdivision; label: string }[] = [
    { value: 1, label: '1/4' },
    { value: 2, label: '1/8' },
    { value: 3, label: t.tripletLabel },
    { value: 4, label: '1/16' },
  ];

  const clickSounds: { value: ClickSound; label: string }[] = [
    { value: 'wood', label: t.timbreWood },
    { value: 'digital', label: t.timbreDigital },
    { value: 'rimshot', label: t.timbreRimshot },
  ];

  const elapsedSec = Math.round(trackProgress * trackDurationSec);
  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside
      aria-label={t.title}
      className="bg-[#0E100C] text-[#EEF1E6] border border-[#2C3027] rounded-[22px] p-4 flex flex-col gap-4 shadow-sm"
    >
      {/* Header Console */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2C3027]">
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight text-[#EEF1E6] truncate">{t.title}</h2>
          <p className="text-xs text-[#B8BFAE] mt-0.5 truncate">
            {activeSong ? `${t.lockedTo}: ${activeSong.title}` : t.readyToSync}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleAutoSync}
          aria-pressed={autoSyncEnabled}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            autoSyncEnabled
              ? 'bg-[#C6F100] text-[#20251E]'
              : 'bg-white/10 text-[#B8BFAE] hover:bg-white/15'
          }`}
        >
          {autoSyncEnabled ? t.autoSyncOn : t.autoSyncOff}
        </button>
      </div>

      {/* Zone 1: Synced Song Slot */}
      <div className="bg-[#161912] border border-[#2C3027] rounded-2xl p-3 flex flex-col gap-2.5">
        {activeSong ? (
          <>
            <div className="flex items-center gap-3">
              <ArtworkImage
                src={activeSong.artworkUrl}
                alt={activeSong.title}
                fallbackLabel={activeSong.title}
                className="w-11 h-11 rounded-lg object-cover shrink-0 border border-[#2C3027]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#EEF1E6] truncate">{activeSong.title}</p>
                <p className="text-xs text-[#B8BFAE] truncate">
                  {activeSong.artist} · {activeSong.album}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-[#B8BFAE]/75 mt-0.5 truncate">
                  {isAnalyzingAudio ? t.analyzingBeat : bpmSourceLabel}
                  {activeSong.musicalKey ? ` · ${activeSong.musicalKey}` : ''}
                </p>
              </div>
              {activeSong.previewUrl ? (
                <button
                  type="button"
                  onClick={onToggleTrackPlay}
                  aria-label={isTrackPlaying ? 'Pause' : 'Play'}
                  className="w-9 h-9 rounded-full bg-[#C6F100] text-[#20251E] hover:brightness-95 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                >
                  {isTrackPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
              ) : null}
            </div>

            {activeSong.previewUrl ? (
              <div className="flex flex-col gap-1">
                <div className="h-1 bg-[#2C3027] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C6F100] transition-[width] duration-100"
                    style={{ width: `${Math.min(100, Math.max(0, trackProgress * 100))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#B8BFAE]/75">
                  <span>{formatSec(elapsedSec)}</span>
                  <span>{formatSec(Math.round(trackDurationSec))}</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#B8BFAE]/80">{t.noPreviewNote}</p>
            )}

            {onOpenCoverFromSong ? (
              <button
                type="button"
                onClick={() => onOpenCoverFromSong(activeSong)}
                className="w-full py-1.5 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-[#2C3027] text-[11px] font-medium text-[#EEF1E6] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#C6F100]" />
                <span>{t.generateCoverForTrack}</span>
              </button>
            ) : null}
          </>
        ) : (
          <div className="flex items-center gap-3 py-1 text-[#B8BFAE]">
            <AudioWaveform className="w-5 h-5 shrink-0 text-[#C6F100]" />
            <p className="text-xs leading-relaxed">{t.selectSongPrompt}</p>
          </div>
        )}
      </div>

      {/* Zone 2: Digital BPM Readout & Beat Sequencer */}
      <div className="bg-[#151812] border border-[#2C3027] rounded-2xl p-3.5 flex flex-col gap-3.5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="text-[11px] text-[#B8BFAE]/75 block mb-0.5">{t.currentTempo}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-mono font-bold tabular-nums tracking-tight text-[#EEF1E6]">
                {bpm}
              </span>
              <span className="text-xs font-mono text-[#B8BFAE]/75">BPM</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleMetronome}
            className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isMetronomePlaying
                ? 'bg-[#C6F100] text-[#20251E] hover:brightness-95'
                : 'bg-[#EEF1E6] text-[#20251E] hover:bg-white'
            }`}
          >
            {isMetronomePlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.stopClick}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.startClick}</span>
              </>
            )}
          </button>
        </div>

        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${beatsPerBar}, minmax(0, 1fr))` }}
          aria-label="Beat steps"
        >
          {beatSteps.map((step) => {
            const isActive = isMetronomePlaying && currentBeatIndex === step;
            const isBeatOne = step === 0;
            return (
              <div
                key={step}
                className={`h-7 rounded-lg border flex items-center justify-center font-mono text-xs tabular-nums transition-transform duration-75 ${
                  isActive
                    ? isBeatOne && accentBeatOne
                      ? 'bg-[#C6F100] border-[#C6F100] text-[#20251E] font-bold scale-[1.03]'
                      : 'bg-[#EEF1E6] border-[#EEF1E6] text-[#20251E] font-bold scale-[1.02]'
                    : 'bg-[#0E100C] border-[#2C3027] text-[#B8BFAE]/60'
                }`}
              >
                {step + 1}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeBpm(bpm - 1)}
            aria-label="-1 BPM"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-[#EEF1E6] shrink-0 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => onChangeBpm(Number(e.target.value))}
            aria-label="BPM"
            className="flex-1 accent-[#C6F100] cursor-pointer"
          />
          <button
            type="button"
            onClick={() => onChangeBpm(bpm + 1)}
            aria-label="+1 BPM"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-[#EEF1E6] shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onTapTempo}
            className="px-3 h-8 rounded-full bg-white/10 hover:bg-white/15 text-xs font-medium text-[#EEF1E6] flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Hand className="w-3.5 h-3.5 text-[#C6F100]" />
            <span>{t.tap}</span>
          </button>
        </div>
      </div>

      {/* Zone 3: Rhythm & Mix Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#B8BFAE]">{t.meter}</span>
            <button
              type="button"
              onClick={onToggleAccent}
              className={`text-[11px] font-medium transition-colors cursor-pointer ${
                accentBeatOne ? 'text-[#C6F100]' : 'text-[#B8BFAE]/60 hover:text-[#EEF1E6]'
              }`}
            >
              {accentBeatOne ? t.accentOn : t.accentOff}
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1 bg-[#161912] p-1 rounded-xl border border-[#2C3027]">
            {TIME_SIGNATURES.map((ts) => (
              <button
                key={ts}
                type="button"
                onClick={() => onChangeTimeSignature(ts)}
                className={`py-1 rounded-lg text-xs font-mono tabular-nums transition-colors cursor-pointer ${
                  timeSignature === ts
                    ? 'bg-[#C6F100] text-[#20251E] font-bold'
                    : 'text-[#B8BFAE] hover:text-[#EEF1E6]'
                }`}
              >
                {ts}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[#B8BFAE]">{t.subdivision}</span>
            <div className="grid grid-cols-4 gap-1 bg-[#161912] p-1 rounded-xl border border-[#2C3027]">
              {subdivisions.map((sub) => (
                <button
                  key={sub.value}
                  type="button"
                  onClick={() => onChangeSubdivision(sub.value)}
                  className={`py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    subdivision === sub.value
                      ? 'bg-[#EEF1E6] text-[#20251E] font-bold'
                      : 'text-[#B8BFAE] hover:text-[#EEF1E6]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[#B8BFAE]">{t.clickTimbre}</span>
            <div className="grid grid-cols-3 gap-1 bg-[#161912] p-1 rounded-xl border border-[#2C3027]">
              {clickSounds.map((snd) => (
                <button
                  key={snd.value}
                  type="button"
                  onClick={() => onChangeClickSound(snd.value)}
                  className={`py-1 rounded-lg text-[11px] font-medium transition-colors truncate cursor-pointer ${
                    clickSound === snd.value
                      ? 'bg-[#EEF1E6] text-[#20251E] font-bold'
                      : 'text-[#B8BFAE] hover:text-[#EEF1E6]'
                  }`}
                >
                  {snd.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[11px] text-[#B8BFAE]">{t.phaseAlign}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onNudgePhase(-25)}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-[11px] font-mono tabular-nums text-[#EEF1E6] cursor-pointer"
            >
              -25ms
            </button>
            <button
              type="button"
              onClick={onRealignPhase}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-[11px] font-medium text-[#EEF1E6] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-[#C6F100]" />
              <span>{t.alignBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => onNudgePhase(25)}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-[11px] font-mono tabular-nums text-[#EEF1E6] cursor-pointer"
            >
              +25ms
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2C3027]">
          <label className="flex flex-col gap-1 text-[11px] text-[#B8BFAE]">
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-[#C6F100]" />
                {t.volClick}
              </span>
              <span className="font-mono tabular-nums text-[#EEF1E6]">
                {Math.round(metronomeVolume * 100)}%
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={metronomeVolume}
              onChange={(e) => onChangeMetronomeVolume(Number(e.target.value))}
              className="accent-[#C6F100] cursor-pointer"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] text-[#B8BFAE]">
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                {t.volTrack}
              </span>
              <span className="font-mono tabular-nums text-[#EEF1E6]">
                {Math.round(trackVolume * 100)}%
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={trackVolume}
              onChange={(e) => onChangeTrackVolume(Number(e.target.value))}
              className="accent-[#EEF1E6] cursor-pointer"
            />
          </label>
        </div>
      </div>
    </aside>
  );
}
