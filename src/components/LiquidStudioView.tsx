import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AudioWaveform,
  Bot,
  Cast,
  Check,
  Database,
  Download,
  ExternalLink,
  Globe,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Moon,
  Music2,
  Palette,
  RotateCcw,
  Search,
  Sliders,
  Sparkles,
  Tv,
  Volume2,
} from 'lucide-react';
import {
  AUDIO_PRESETS,
  AUDIO_QUALITIES,
  AUTOEQ_PROFILES,
  DEFAULT_AUDIO_FX,
  EQ_15_LABELS,
  ZERO_EQ_15,
  type AudioEffectsChain,
} from '../audio/audioEffectsEngine';
import type { CastStatus } from '../hooks/useGoogleCast';
import { LANGUAGES, type Translations } from '../i18n/translations';
import type {
  AppLanguage,
  ArtworkPalette,
  AudioFxSettings,
  AudioPresetId,
  AudioQualityId,
  AutoEqProfileId,
  ScreenThemeId,
  SongItem,
  TargetLufs,
  VisualSettings,
  VisualizerStyleId,
} from '../types/music';
import { LiquidStageCanvas } from './LiquidStageCanvas';

export type LastWaveSettingsSection =
  | 'audio'
  | 'playback'
  | 'appearance'
  | 'lyrics'
  | 'library'
  | 'covers'
  | 'chat';

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  theme: 'liquid-glass',
  visualizer: 'liquid-waves',
  glassBlurPx: 18,
  motionIntensity: 75,
  customAccentHex: '#C6F100',
  showAlbumInStage: true,
  hapticBeatEnabled: true,
  lyricsFontSize: 'md',
  lyricsCenterAlign: true,
  lyricsAutoScroll: true,
};

interface LiquidStudioViewProps {
  t: Translations['liquid'];
  navT: Translations['nav'];
  toolbarT: Translations['toolbar'];
  effectsChain: AudioEffectsChain;
  audioFx: AudioFxSettings;
  visualSettings: VisualSettings;
  palette: ArtworkPalette;
  activeSong: SongItem | null;
  bpm: number;
  timeSignature: string;
  isTrackPlaying: boolean;
  isMetronomePlaying: boolean;
  currentBeatIndex: number;
  autoSyncEnabled: boolean;
  castStatus: CastStatus;
  castDeviceName: string | null;
  isCastingSong: boolean;
  lastCastSongTitle: string | null;
  castErrorCode: null | 'NO_PREVIEW' | 'IFRAME_OR_UNAVAILABLE' | 'SESSION_FAILED' | 'MEDIA_FAILED';
  isInIframe: boolean;
  language: AppLanguage;
  country: 'it' | 'us';
  sleepTimerMinutes: number;
  sleepRemainingSec: number | null;
  historyCount: number;
  playlistsCount: number;
  initialSection?: LastWaveSettingsSection;
  coversSlot: ReactNode;
  chatSlot: ReactNode;
  onChangeAudioFx: (next: AudioFxSettings) => void;
  onChangeVisualSettings: (next: VisualSettings) => void;
  onToggleTrackPlay: () => void;
  onToggleAutoSync: () => void;
  onRequestCast: () => void;
  onStopCast: () => void;
  onCastActiveSong: () => void;
  onChangeLanguage: (lang: AppLanguage) => void;
  onChangeCountry: (country: 'it' | 'us') => void;
  onSetSleepTimer: (minutes: number) => void;
  onOpenLyrics: () => void;
  onClearHistory: () => void;
  onExportLibraryJson: () => void;
}

const ACCENT_SWATCHES = ['#C6F100', '#536716', '#10B981', '#0EA5E9', '#D97706', '#EC4899'];

const PRESET_ORDER: AudioPresetId[] = [
  'atmos',
  'liquid-warmth',
  'club-bass',
  'vocal',
  'night',
  'flat',
];

const QUALITY_ORDER: AudioQualityId[] = [
  'atmos-mp3',
  'cd-lossless',
  'hires-96',
  'master-192',
];

const AUTOEQ_ORDER: AutoEqProfileId[] = [
  'harman-2019',
  'airpods-pro-2',
  'sony-xm5',
  'hd650',
  'dt770',
  'm50x',
  'earpods',
  'none',
];

const THEME_ORDER: ScreenThemeId[] = [
  'liquid-glass',
  'obsidian-dark',
  'amoled-black',
  'studio-light',
  'dynamic-cover',
];

const VISUALIZER_ORDER: VisualizerStyleId[] = [
  'liquid-waves',
  'orbital-glass',
  'spectrum-silk',
  'cover-aura',
];

const SLEEP_OPTIONS = [0, 15, 30, 45, 60];
const LUFS_OPTIONS: TargetLufs[] = [-14, -16, -18];

const BASE_WAVE_BARS = [
  24, 42, 65, 48, 78, 92, 54, 38, 72, 86, 62, 44, 94, 70, 52, 82, 68, 40, 74, 88, 56, 36, 66, 46,
];

export function LiquidStudioView({
  t,
  navT,
  toolbarT,
  effectsChain,
  audioFx,
  visualSettings,
  palette,
  activeSong,
  bpm,
  timeSignature,
  isTrackPlaying,
  isMetronomePlaying,
  currentBeatIndex,
  autoSyncEnabled,
  castStatus,
  castDeviceName,
  isCastingSong,
  lastCastSongTitle,
  castErrorCode,
  isInIframe,
  language,
  country,
  sleepTimerMinutes,
  sleepRemainingSec,
  historyCount,
  playlistsCount,
  initialSection = 'audio',
  coversSlot,
  chatSlot,
  onChangeAudioFx,
  onChangeVisualSettings,
  onToggleTrackPlay,
  onToggleAutoSync,
  onRequestCast,
  onStopCast,
  onCastActiveSong,
  onChangeLanguage,
  onChangeCountry,
  onSetSleepTimer,
  onOpenLyrics,
  onClearHistory,
  onExportLibraryJson,
}: LiquidStudioViewProps) {
  const [section, setSection] = useState<LastWaveSettingsSection>(initialSection);
  const [waveBars, setWaveBars] = useState<number[]>(BASE_WAVE_BARS);
  const [headphoneQuery, setHeadphoneQuery] = useState('');

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (!isTrackPlaying && !isMetronomePlaying) {
      setWaveBars(BASE_WAVE_BARS);
      return;
    }

    let rafId = 0;
    const tick = () => {
      const { bins, overall } = effectsChain.sampleAudioLevels();
      setWaveBars(
        BASE_WAVE_BARS.map((base, i) => {
          const binVal = bins[Math.min(bins.length - 1, i * 3)] || 0;
          const livePct = Math.round((binVal / 255) * 90 + overall * 22);
          return Math.max(14, Math.min(100, isTrackPlaying ? livePct : Math.round(base * 0.72)));
        })
      );
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [effectsChain, isTrackPlaying, isMetronomePlaying]);

  const filteredAutoEq = useMemo(() => {
    const q = headphoneQuery.trim().toLowerCase();
    if (!q) return AUTOEQ_ORDER;
    return AUTOEQ_ORDER.filter((id) => AUTOEQ_PROFILES[id].label.toLowerCase().includes(q));
  }, [headphoneQuery]);

  const handleSelectPreset = (preset: AudioPresetId) => {
    const p = AUDIO_PRESETS[preset];
    onChangeAudioFx({
      ...audioFx,
      preset,
      bassDb: p.bassDb,
      midDb: p.midDb,
      trebleDb: p.trebleDb,
      spatialWidth: p.spatialWidth,
      reverbMix: p.reverbMix,
    });
  };

  const handleSelectAutoEq = (profile: AutoEqProfileId) => {
    onChangeAudioFx({
      ...audioFx,
      autoEqProfile: profile,
      eq15Bands: [...AUTOEQ_PROFILES[profile].bands],
    });
  };

  const handleEqBandChange = (idx: number, val: number) => {
    const baseBands =
      audioFx.eq15Bands && audioFx.eq15Bands.length === 15
        ? [...audioFx.eq15Bands]
        : [...ZERO_EQ_15];
    baseBands[idx] = val;
    onChangeAudioFx({
      ...audioFx,
      autoEqProfile: 'none',
      eq15Bands: baseBands,
    });
  };

  const activeQualityMeta = AUDIO_QUALITIES[audioFx.quality] || AUDIO_QUALITIES['master-192'];
  const eqBands =
    audioFx.eq15Bands && audioFx.eq15Bands.length === 15 ? audioFx.eq15Bands : ZERO_EQ_15;

  const castErrorMessage =
    castErrorCode === 'NO_PREVIEW'
      ? t.castErrNoPreview
      : castErrorCode === 'SESSION_FAILED'
        ? t.castErrSession
        : castErrorCode === 'MEDIA_FAILED'
          ? t.castErrMedia
          : castErrorCode === 'IFRAME_OR_UNAVAILABLE'
            ? t.castUnavailable
            : null;

  const standaloneUrl = typeof window !== 'undefined' ? window.location.href : '';

  const categories: {
    id: LastWaveSettingsSection;
    label: string;
    subtitle: string;
    icon: typeof Volume2;
  }[] = [
    { id: 'audio', label: 'Audio & Qualità', subtitle: 'Lossless, DAC, EQ 15 Bande, AutoEQ', icon: Volume2 },
    { id: 'playback', label: 'Riproduzione & Cast', subtitle: 'Automix, Sleep Timer, Cast', icon: Sliders },
    { id: 'appearance', label: 'Aspetto & Liquid', subtitle: 'Temi, AMOLED, Monet, Haptics', icon: Palette },
    { id: 'lyrics', label: 'Testi Live (LRCLIB)', subtitle: 'Sincronizzati, font, allineamento', icon: Music2 },
    { id: 'library', label: 'Libreria & Rete', subtitle: 'Lingua, regione, cache e backup', icon: Database },
    { id: 'covers', label: navT.covers, subtitle: 'Copertine 1K–4K', icon: ImageIcon },
    { id: 'chat', label: navT.chat, subtitle: 'Assistente musicale', icon: Bot },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Top LastWave Settings Banner + Live Sound Hardware Monitor */}
      <section className="lw-glass-card rounded-[24px] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-[#536716] dark:text-[#C6F100]">
            LASTWAVE ARCHITECTURE · {navT.studio.toUpperCase()}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#20251E] dark:text-[#EEF1E6] mt-1">
            Impostazioni <span className="lw-em-lime">Liquid</span> &amp; Audio Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5E57] dark:text-[#B8BFAE] mt-1 max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        <div className="lw-sound-visual rounded-2xl p-4 min-w-[270px] shrink-0">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#B8BFAE]">
            <span>{t.soundMonitorEyebrow}</span>
            <AudioWaveform className="w-3.5 h-3.5 text-[#C6F100]" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-3">
            <strong className="text-base font-bold tracking-tight text-[#EEF1E6]">
              {activeQualityMeta.badge}
            </strong>
            <span className="text-[11px] font-mono text-[#C6F100]">
              {audioFx.bitPerfectMode ? 'BIT-PERFECT' : '15-BAND EQ'}
            </span>
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-1 h-8" aria-hidden="true">
            {waveBars.map((pct, i) => (
              <span
                key={i}
                className="flex-1 rounded-full bg-[#C6F100]/85 transition-[height] duration-75"
                style={{ height: `${pct}%` }}
              />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-[#2C3027] flex items-center justify-between text-[11px] font-mono tabular-nums text-[#B8BFAE]">
            <span>{activeQualityMeta.spec}</span>
            <span>
              {audioFx.uac2ClockBypass ? 'UAC2 ' : ''}
              {Math.round(effectsChain.getSampleRate() / 1000)} kHz
            </span>
          </div>
        </div>
      </section>

      {/* Authentic LastWave 2-Column Settings Shell (Left Category Rail + Right Structured Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)] gap-5 items-start">
        {/* Left LastWave Settings Rail */}
        <aside className="lw-glass-card rounded-[22px] p-2.5 flex lg:flex-col gap-1 overflow-x-auto lg:sticky lg:top-20">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = section === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSection(cat.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all whitespace-nowrap lg:whitespace-normal shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                    : 'hover:bg-white/60 dark:hover:bg-white/5 text-[#20251E] dark:text-[#EEF1E6]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#C6F100] dark:text-[#20251E]' : 'text-[#536716] dark:text-[#C6F100]'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">{cat.label}</p>
                  <p
                    className={`hidden lg:block text-[10px] truncate mt-0.5 ${
                      active ? 'opacity-80' : 'text-[#5B5E57] dark:text-[#B8BFAE]'
                    }`}
                  >
                    {cat.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Right Structured Settings Content */}
        <div className="flex flex-col gap-5 min-w-0">
          {section === 'audio' ? (
            <>
              {/* Audio Output, Bit-Perfect DAC & LUFS Normalization Group */}
              <section className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D6D6CF] dark:border-[#2C3027]">
                  <h2 className="text-sm font-bold text-[#20251E] dark:text-[#EEF1E6] flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#536716] dark:text-[#C6F100]" />
                    <span>{t.audioSectionTitle}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => onChangeAudioFx(DEFAULT_AUDIO_FX)}
                    className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.audioReset}</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] block mb-2">
                    {t.qualityLabel}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {QUALITY_ORDER.map((qId) => {
                      const isSelected = audioFx.quality === qId;
                      return (
                        <button
                          key={qId}
                          type="button"
                          onClick={() => onChangeAudioFx({ ...audioFx, quality: qId })}
                          className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-colors truncate cursor-pointer ${
                            isSelected
                              ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] border-[#20251E] dark:border-[#C6F100] font-semibold'
                              : 'bg-[#F4F4F0]/70 dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#20251E] dark:text-[#EEF1E6] hover:border-[#536716] dark:hover:border-[#C6F100]'
                          }`}
                        >
                          {t.qualities[qId]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* LastWave Hardware Switches: Bit-Perfect, UAC2 Dual Crystal, ReplayGain / LUFS */}
                <div className="grid grid-cols-1 gap-2.5">
                  <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5 cursor-pointer">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[#20251E] dark:text-[#EEF1E6] block">
                        {t.bitPerfectTitle}
                      </span>
                      <span className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] block mt-0.5">
                        {t.bitPerfectDesc}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={audioFx.bitPerfectMode}
                      onChange={(e) =>
                        onChangeAudioFx({ ...audioFx, bitPerfectMode: e.target.checked })
                      }
                      className="mt-0.5 rounded border-[#D6D6CF] accent-[#536716] dark:accent-[#C6F100]"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5 cursor-pointer">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[#20251E] dark:text-[#EEF1E6] block">
                        Dual-Crystal UAC2 Clock Switching (44.1 / 48 kHz)
                      </span>
                      <span className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] block mt-0.5">
                        Allinea automaticamente la frequenza hardware al file originale evitando ricampionamenti.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={audioFx.uac2ClockBypass}
                      onChange={(e) =>
                        onChangeAudioFx({ ...audioFx, uac2ClockBypass: e.target.checked })
                      }
                      className="mt-0.5 rounded border-[#D6D6CF] accent-[#536716] dark:accent-[#C6F100]"
                    />
                  </label>

                  <div className="p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5 flex flex-col gap-2.5">
                    <label className="flex items-start justify-between gap-3 cursor-pointer">
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#20251E] dark:text-[#EEF1E6] block">
                          Normalizzazione Audio (ReplayGain / LUFS)
                        </span>
                        <span className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] block mt-0.5">
                          Mantiene costante il volume percepito tra tracce e album diversi.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={audioFx.normalizationEnabled}
                        onChange={(e) =>
                          onChangeAudioFx({ ...audioFx, normalizationEnabled: e.target.checked })
                        }
                        className="mt-0.5 rounded border-[#D6D6CF] accent-[#536716] dark:accent-[#C6F100]"
                      />
                    </label>

                    {audioFx.normalizationEnabled ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] mr-auto">
                          Target Loudness:
                        </span>
                        {LUFS_OPTIONS.map((lufs) => (
                          <button
                            key={lufs}
                            type="button"
                            onClick={() => onChangeAudioFx({ ...audioFx, targetLufs: lufs })}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold cursor-pointer ${
                              audioFx.targetLufs === lufs
                                ? 'bg-[#C6F100] text-[#20251E]'
                                : 'bg-[#ECECE6] dark:bg-white/10 text-[#20251E] dark:text-[#EEF1E6]'
                            }`}
                          >
                            {lufs} LUFS
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* Full LastWave 15-Band Parametric EQ & Searchable AutoEQ */}
              <section className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D6D6CF] dark:border-[#2C3027]">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-[#536716] dark:text-[#C6F100]" />
                    <h2 className="text-sm font-bold text-[#20251E] dark:text-[#EEF1E6]">
                      {t.eq15Title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3 h-3 text-[#5B5E57] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={headphoneQuery}
                        onChange={(e) => setHeadphoneQuery(e.target.value)}
                        placeholder="Cerca cuffie..."
                        aria-label="Cerca profilo cuffie AutoEQ"
                        className="w-36 rounded-lg border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] pl-7 pr-2 py-1 text-xs text-[#20251E] dark:text-[#EEF1E6]"
                      />
                    </div>
                    <select
                      value={audioFx.autoEqProfile}
                      onChange={(e) => handleSelectAutoEq(e.target.value as AutoEqProfileId)}
                      disabled={audioFx.bitPerfectMode}
                      aria-label={t.autoEqLabel}
                      className="rounded-lg border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-2.5 py-1 text-xs font-medium text-[#20251E] dark:text-[#EEF1E6] disabled:opacity-50"
                    >
                      {filteredAutoEq.map((id) => (
                        <option key={id} value={id}>
                          {AUTOEQ_PROFILES[id].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto pb-1">
                  <div
                    className="grid gap-1.5 min-w-[660px]"
                    style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
                  >
                    {EQ_15_LABELS.map((freqLabel, idx) => {
                      const val = eqBands[idx] ?? 0;
                      return (
                        <div
                          key={freqLabel}
                          className="flex flex-col items-center gap-2 rounded-xl border border-[#D6D6CF]/70 dark:border-[#2C3027] bg-[#F4F4F0]/70 dark:bg-[#0E100C]/60 py-2.5 px-1"
                        >
                          <span className="text-[10px] font-mono tabular-nums font-semibold text-[#20251E] dark:text-[#C6F100]">
                            {val > 0 ? `+${val}` : val}
                          </span>
                          <div className="h-24 flex items-center justify-center">
                            <input
                              type="range"
                              min={-12}
                              max={12}
                              step={0.5}
                              value={val}
                              disabled={audioFx.bitPerfectMode}
                              aria-label={`${freqLabel} Hz`}
                              onChange={(e) => handleEqBandChange(idx, Number(e.target.value))}
                              className="w-20 -rotate-90 accent-[#536716] dark:accent-[#C6F100] cursor-pointer disabled:opacity-40"
                            />
                          </div>
                          <span className="text-[10px] font-mono text-[#5B5E57] dark:text-[#B8BFAE]">
                            {freqLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Macro Tone & Spatial FX */}
                <div className="pt-2 border-t border-[#D6D6CF]/70 dark:border-[#2C3027] flex flex-col gap-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {PRESET_ORDER.map((presetId) => {
                      const isSelected = audioFx.preset === presetId;
                      return (
                        <button
                          key={presetId}
                          type="button"
                          disabled={audioFx.bitPerfectMode}
                          onClick={() => handleSelectPreset(presetId)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-left transition-colors whitespace-nowrap truncate cursor-pointer disabled:opacity-45 ${
                            isSelected
                              ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] border-[#20251E] dark:border-[#C6F100] font-semibold'
                              : 'bg-[#F4F4F0]/70 dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#20251E] dark:text-[#EEF1E6] hover:border-[#536716] dark:hover:border-[#C6F100]'
                          }`}
                        >
                          {t.presets[presetId]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5B5E57] dark:text-[#B8BFAE]">{t.bassLabel}</span>
                        <span className="font-mono tabular-nums font-semibold">
                          {audioFx.bassDb > 0 ? `+${audioFx.bassDb}` : audioFx.bassDb} dB
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        step={0.5}
                        disabled={audioFx.bitPerfectMode}
                        value={audioFx.bassDb}
                        onChange={(e) =>
                          onChangeAudioFx({ ...audioFx, bassDb: Number(e.target.value) })
                        }
                        className="accent-[#536716] dark:accent-[#C6F100] cursor-pointer disabled:opacity-45"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5B5E57] dark:text-[#B8BFAE]">{t.midLabel}</span>
                        <span className="font-mono tabular-nums font-semibold">
                          {audioFx.midDb > 0 ? `+${audioFx.midDb}` : audioFx.midDb} dB
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        step={0.5}
                        disabled={audioFx.bitPerfectMode}
                        value={audioFx.midDb}
                        onChange={(e) =>
                          onChangeAudioFx({ ...audioFx, midDb: Number(e.target.value) })
                        }
                        className="accent-[#536716] dark:accent-[#C6F100] cursor-pointer disabled:opacity-45"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5B5E57] dark:text-[#B8BFAE]">{t.trebleLabel}</span>
                        <span className="font-mono tabular-nums font-semibold">
                          {audioFx.trebleDb > 0 ? `+${audioFx.trebleDb}` : audioFx.trebleDb} dB
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        step={0.5}
                        disabled={audioFx.bitPerfectMode}
                        value={audioFx.trebleDb}
                        onChange={(e) =>
                          onChangeAudioFx({ ...audioFx, trebleDb: Number(e.target.value) })
                        }
                        className="accent-[#536716] dark:accent-[#C6F100] cursor-pointer disabled:opacity-45"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5B5E57] dark:text-[#B8BFAE]">{t.spatialLabel}</span>
                        <span className="font-mono tabular-nums font-semibold">
                          {audioFx.spatialWidth}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        disabled={audioFx.bitPerfectMode}
                        value={audioFx.spatialWidth}
                        onChange={(e) =>
                          onChangeAudioFx({ ...audioFx, spatialWidth: Number(e.target.value) })
                        }
                        className="accent-[#536716] dark:accent-[#C6F100] cursor-pointer disabled:opacity-45"
                      />
                    </label>
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {section === 'playback' ? (
            <>
              <section className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-4">
                <h2 className="text-sm font-bold text-[#20251E] dark:text-[#EEF1E6] flex items-center gap-2 pb-3 border-b border-[#D6D6CF] dark:border-[#2C3027]">
                  <Sliders className="w-4 h-4 text-[#536716] dark:text-[#C6F100]" />
                  <span>Automix, Tempo &amp; Sleep Timer</span>
                </h2>

                <div className="p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5 flex flex-col gap-2.5">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold block">{t.automixTitle}</span>
                      <span className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] block mt-0.5">
                        {t.automixDesc}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={audioFx.automixEnabled}
                      onChange={(e) =>
                        onChangeAudioFx({ ...audioFx, automixEnabled: e.target.checked })
                      }
                      className="mt-0.5 rounded border-[#D6D6CF] accent-[#536716] dark:accent-[#C6F100]"
                    />
                  </label>

                  {audioFx.automixEnabled ? (
                    <label className="flex items-center justify-between gap-3 pt-1 text-xs">
                      <span className="text-[#5B5E57] dark:text-[#B8BFAE]">{t.crossfadeLabel}</span>
                      <input
                        type="range"
                        min={0}
                        max={12}
                        step={1}
                        value={audioFx.crossfadeSec}
                        onChange={(e) =>
                          onChangeAudioFx({ ...audioFx, crossfadeSec: Number(e.target.value) })
                        }
                        className="flex-1 accent-[#536716] dark:accent-[#C6F100] cursor-pointer"
                      />
                      <span className="font-mono tabular-nums font-semibold w-8 text-right">
                        {audioFx.crossfadeSec}s
                      </span>
                    </label>
                  ) : null}
                </div>

                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold block">
                      Sincronizzazione Automatica Metronomo
                    </span>
                    <span className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] block mt-0.5">
                      Avvia e aggancia automaticamente il BPM del metronomo ad ogni brano selezionato.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={onToggleAutoSync}
                    className="mt-0.5 rounded border-[#D6D6CF] accent-[#536716] dark:accent-[#C6F100]"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5B5E57] dark:text-[#B8BFAE]">{t.reverbLabel}</span>
                      <span className="font-mono tabular-nums font-semibold">{audioFx.reverbMix}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      disabled={audioFx.bitPerfectMode}
                      value={audioFx.reverbMix}
                      onChange={(e) =>
                        onChangeAudioFx({ ...audioFx, reverbMix: Number(e.target.value) })
                      }
                      className="accent-[#536716] dark:accent-[#C6F100] cursor-pointer"
                    />
                  </label>

                  <label className="flex flex-col gap-1 p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5B5E57] dark:text-[#B8BFAE]">{t.speedLabel}</span>
                      <span className="font-mono tabular-nums font-semibold">
                        {audioFx.playbackRate.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.75}
                      max={1.25}
                      step={0.05}
                      value={audioFx.playbackRate}
                      onChange={(e) =>
                        onChangeAudioFx({ ...audioFx, playbackRate: Number(e.target.value) })
                      }
                      className="accent-[#536716] dark:accent-[#C6F100] cursor-pointer"
                    />
                  </label>
                </div>

                {/* Sleep Timer */}
                <div className="p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-[#536716] dark:text-[#C6F100]" />
                      <span>Sleep Timer (Spegnimento Automatico)</span>
                    </span>
                    {sleepRemainingSec !== null && sleepRemainingSec > 0 ? (
                      <span className="text-xs font-mono font-bold text-[#536716] dark:text-[#C6F100]">
                        {Math.floor(sleepRemainingSec / 60)}:
                        {String(sleepRemainingSec % 60).padStart(2, '0')}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SLEEP_OPTIONS.map((min) => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => onSetSleepTimer(min)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                          sleepTimerMinutes === min
                            ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                            : 'bg-[#ECECE6] dark:bg-white/10 text-[#20251E] dark:text-[#EEF1E6]'
                        }`}
                      >
                        {min === 0 ? 'Off' : `${min} min`}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Google Cast Panel tucked cleanly under Playback & Cast */}
              <section className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] flex items-center justify-center shrink-0">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#20251E] dark:text-[#EEF1E6]">
                        {t.castTitle}
                      </h2>
                      <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5">
                        {t.castSubtitle}
                      </p>
                      <p className="text-xs font-medium mt-1.5 text-[#20251E] dark:text-[#EEF1E6] flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#536716] dark:text-[#C6F100]" />
                        <span>
                          {castStatus === 'connected'
                            ? `${t.castConnectedTo} ${castDeviceName || 'Google Cast'}`
                            : castStatus === 'unavailable'
                              ? t.castUnavailable
                              : t.castReady}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {castStatus === 'connected' ? (
                      <>
                        <button
                          type="button"
                          disabled={!activeSong?.previewUrl || isCastingSong}
                          onClick={onCastActiveSong}
                          className="px-4 py-2 rounded-full bg-[#C6F100] hover:brightness-95 disabled:opacity-50 text-[#20251E] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          {isCastingSong ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{t.castSending}</span>
                            </>
                          ) : (
                            <>
                              <Cast className="w-3.5 h-3.5" />
                              <span>{t.castSendTrackBtn}</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={onStopCast}
                          className="px-4 py-2 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] cursor-pointer"
                        >
                          {t.castDisconnectBtn}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={onRequestCast}
                        className="px-4 py-2 rounded-full bg-[#20251E] dark:bg-[#C6F100] hover:opacity-90 text-[#F4F4F0] dark:text-[#20251E] text-xs font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <Cast className="w-4 h-4" />
                        <span>{t.castConnectBtn}</span>
                      </button>
                    )}
                  </div>
                </div>

                {lastCastSongTitle ? (
                  <p className="text-xs font-medium text-[#536716] dark:text-[#C6F100]">
                    {t.castActiveTrackSent}: {lastCastSongTitle}
                  </p>
                ) : null}

                {castErrorMessage ? (
                  <div className="rounded-xl border border-[#D97706]/30 bg-[#D97706]/10 px-3.5 py-2.5 text-xs text-[#92400E] dark:text-[#FCD34D] flex flex-wrap items-center justify-between gap-2">
                    <span>{castErrorMessage}</span>
                    {isInIframe && standaloneUrl ? (
                      <a
                        href={standaloneUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline underline-offset-2 inline-flex items-center gap-1"
                      >
                        <span>{t.castOpenStandalone}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                ) : isInIframe ? (
                  <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE]">{t.castIframeNote}</p>
                ) : null}
              </section>
            </>
          ) : null}

          {section === 'appearance' ? (
            <>
              <LiquidStageCanvas
                effectsChain={effectsChain}
                visualSettings={visualSettings}
                palette={palette}
                activeSong={activeSong}
                bpm={bpm}
                timeSignature={timeSignature}
                isTrackPlaying={isTrackPlaying}
                isMetronomePlaying={isMetronomePlaying}
                currentBeatIndex={currentBeatIndex}
                castConnected={castStatus === 'connected'}
                fullscreenLabel={t.fullscreen}
                exitFullscreenLabel={t.exitFullscreen}
                noTrackLabel={t.stageNoTrack}
                castBtnLabel={
                  castStatus === 'connected' && castDeviceName ? castDeviceName : 'Google Cast'
                }
                playLabel={t.playBtn}
                pauseLabel={t.pauseBtn}
                qualityBadge={activeQualityMeta.spec}
                onToggleTrackPlay={onToggleTrackPlay}
                onCastClick={castStatus === 'connected' ? onCastActiveSong : onRequestCast}
              />

              <section className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D6D6CF] dark:border-[#2C3027]">
                  <h2 className="text-sm font-bold text-[#20251E] dark:text-[#EEF1E6] flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#536716] dark:text-[#C6F100]" />
                    <span>{t.screenSectionTitle}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => onChangeVisualSettings(DEFAULT_VISUAL_SETTINGS)}
                    className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.visualReset}</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] block mb-2">
                    {t.themeLabel}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {THEME_ORDER.map((themeId) => {
                      const active = visualSettings.theme === themeId;
                      return (
                        <button
                          key={themeId}
                          type="button"
                          onClick={() =>
                            onChangeVisualSettings({ ...visualSettings, theme: themeId })
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors whitespace-nowrap truncate cursor-pointer ${
                            active
                              ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] border-[#20251E] dark:border-[#C6F100] font-semibold'
                              : 'bg-[#F4F4F0]/70 dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#20251E] dark:text-[#EEF1E6] hover:border-[#536716] dark:hover:border-[#C6F100]'
                          }`}
                        >
                          {t.themes[themeId]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] block mb-2">
                    {t.visualizerLabel}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {VISUALIZER_ORDER.map((vizId) => {
                      const active = visualSettings.visualizer === vizId;
                      return (
                        <button
                          key={vizId}
                          type="button"
                          onClick={() =>
                            onChangeVisualSettings({ ...visualSettings, visualizer: vizId })
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors whitespace-nowrap truncate cursor-pointer flex items-center gap-1.5 ${
                            active
                              ? 'bg-[#C6F100] text-[#20251E] border-[#C6F100] font-semibold'
                              : 'bg-[#F4F4F0]/70 dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#20251E] dark:text-[#EEF1E6] hover:border-[#536716] dark:hover:border-[#C6F100]'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{t.visualizers[vizId]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] block mb-2">
                    {t.accentLabel} (Dynamic Monet)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeVisualSettings({ ...visualSettings, customAccentHex: '' })
                      }
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${
                        !visualSettings.customAccentHex
                          ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] border-[#20251E] dark:border-[#C6F100] font-semibold'
                          : 'bg-[#F4F4F0]/70 dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#5B5E57] dark:text-[#B8BFAE]'
                      }`}
                    >
                      {t.accentAutoCover}
                    </button>
                    {ACCENT_SWATCHES.map((hex) => {
                      const selected = visualSettings.customAccentHex === hex;
                      const isLightSwatch = hex.toUpperCase() === '#C6F100';
                      return (
                        <button
                          key={hex}
                          type="button"
                          aria-label={hex}
                          onClick={() =>
                            onChangeVisualSettings({ ...visualSettings, customAccentHex: hex })
                          }
                          style={{ backgroundColor: hex }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer border border-black/15 ${
                            selected
                              ? 'ring-2 ring-offset-2 ring-[#20251E] dark:ring-[#C6F100] scale-105'
                              : ''
                          }`}
                        >
                          {selected ? (
                            <Check
                              className={`w-3.5 h-3.5 ${isLightSwatch ? 'text-[#20251E]' : 'text-white'}`}
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  <label className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5B5E57] dark:text-[#B8BFAE]">{t.glassBlurLabel}</span>
                      <span className="font-mono tabular-nums font-semibold">
                        {visualSettings.glassBlurPx}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={28}
                      step={2}
                      value={visualSettings.glassBlurPx}
                      onChange={(e) =>
                        onChangeVisualSettings({
                          ...visualSettings,
                          glassBlurPx: Number(e.target.value),
                        })
                      }
                      className="accent-[#536716] dark:accent-[#C6F100] cursor-pointer"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5B5E57] dark:text-[#B8BFAE]">{t.motionLabel}</span>
                      <span className="font-mono tabular-nums font-semibold">
                        {visualSettings.motionIntensity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={visualSettings.motionIntensity}
                      onChange={(e) =>
                        onChangeVisualSettings({
                          ...visualSettings,
                          motionIntensity: Number(e.target.value),
                        })
                      }
                      className="accent-[#536716] dark:accent-[#C6F100] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-2.5 pt-1 text-xs cursor-pointer">
                    <span>{t.showCoverToggle}</span>
                    <input
                      type="checkbox"
                      checked={visualSettings.showAlbumInStage}
                      onChange={(e) =>
                        onChangeVisualSettings({
                          ...visualSettings,
                          showAlbumInStage: e.target.checked,
                        })
                      }
                      className="rounded border-[#D6D6CF] accent-[#536716] dark:accent-[#C6F100]"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-2.5 text-xs cursor-pointer">
                    <span>Haptic Beat Pulse (Vibrazione sincronizzata al BPM su mobile)</span>
                    <input
                      type="checkbox"
                      checked={visualSettings.hapticBeatEnabled}
                      onChange={(e) =>
                        onChangeVisualSettings({
                          ...visualSettings,
                          hapticBeatEnabled: e.target.checked,
                        })
                      }
                      className="rounded border-[#D6D6CF] accent-[#536716] dark:accent-[#C6F100]"
                    />
                  </label>
                </div>
              </section>
            </>
          ) : null}

          {section === 'lyrics' ? (
            <section className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D6D6CF] dark:border-[#2C3027]">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <Music2 className="w-4 h-4 text-[#536716] dark:text-[#C6F100]" />
                    <span>Testi Sincronizzati Live (LRCLIB)</span>
                  </h2>
                  <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5">
                    Configura dimensione, allineamento e scorrimento automatico dei testi sincronizzati al millisecondo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenLyrics}
                  className="px-4 py-2 rounded-full bg-[#C6F100] text-[#20251E] text-xs font-bold shrink-0 cursor-pointer hover:brightness-95"
                >
                  Apri Testo Live
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] block mb-2">
                    Dimensione Carattere Testo
                  </span>
                  <div className="flex items-center gap-2">
                    {(['sm', 'md', 'lg'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() =>
                          onChangeVisualSettings({ ...visualSettings, lyricsFontSize: sz })
                        }
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                          visualSettings.lyricsFontSize === sz
                            ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                            : 'bg-[#ECECE6] dark:bg-white/10 text-[#20251E] dark:text-[#EEF1E6]'
                        }`}
                      >
                        {sz === 'sm' ? 'Compatto' : sz === 'md' ? 'Standard' : 'Grande'}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5 cursor-pointer">
                  <span className="text-xs font-semibold flex items-center gap-2">
                    {visualSettings.lyricsCenterAlign ? (
                      <AlignCenter className="w-4 h-4 text-[#536716] dark:text-[#C6F100]" />
                    ) : (
                      <AlignLeft className="w-4 h-4 text-[#536716] dark:text-[#C6F100]" />
                    )}
                    <span>Allineamento Testo Centrato</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={visualSettings.lyricsCenterAlign}
                    onChange={(e) =>
                      onChangeVisualSettings({
                        ...visualSettings,
                        lyricsCenterAlign: e.target.checked,
                      })
                    }
                    className="rounded border-[#D6D6CF] accent-[#536716] dark:accent-[#C6F100]"
                  />
                </label>

                <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5 cursor-pointer">
                  <span className="text-xs font-semibold">Scorrimento Automatico Righe</span>
                  <input
                    type="checkbox"
                    checked={visualSettings.lyricsAutoScroll}
                    onChange={(e) =>
                      onChangeVisualSettings({
                        ...visualSettings,
                        lyricsAutoScroll: e.target.checked,
                      })
                    }
                    className="rounded border-[#D6D6CF] accent-[#536716] dark:accent-[#C6F100]"
                  />
                </label>
              </div>
            </section>
          ) : null}

          {section === 'library' ? (
            <section className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-4">
              <h2 className="text-sm font-bold flex items-center gap-2 pb-3 border-b border-[#D6D6CF] dark:border-[#2C3027]">
                <Globe className="w-4 h-4 text-[#536716] dark:text-[#C6F100]" />
                <span>Libreria, Lingua &amp; Dati Locali</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5">
                  <span className="text-xs font-semibold">{toolbarT.languageLabel}</span>
                  <select
                    value={language}
                    onChange={(e) => onChangeLanguage(e.target.value as AppLanguage)}
                    className="rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-3 py-2 text-xs font-medium"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5">
                  <span className="text-xs font-semibold">Regione Catalogo Live</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onChangeCountry('it')}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                        country === 'it'
                          ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                          : 'bg-[#ECECE6] dark:bg-white/10'
                      }`}
                    >
                      {toolbarT.regionItaly}
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeCountry('us')}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                        country === 'us'
                          ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                          : 'bg-[#ECECE6] dark:bg-white/10'
                      }`}
                    >
                      {toolbarT.regionGlobal}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/60 dark:bg-white/5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold">Archivio Locale &amp; Installazione Chrome</p>
                  <p className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5 font-mono tabular-nums">
                    {playlistsCount} playlist · {historyCount} brani in cronologia
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onExportLibraryJson}
                    className="px-3.5 py-2 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Esporta JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="px-3.5 py-2 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#B91C1C] cursor-pointer"
                  >
                    Svuota Cronologia
                  </button>
                  <a
                    href="/scarica"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-full bg-[#C6F100] text-[#20251E] text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Scarica App Chrome</span>
                  </a>
                </div>
              </div>
            </section>
          ) : null}

          {section === 'covers' ? coversSlot : null}
          {section === 'chat' ? chatSlot : null}
        </div>
      </div>
    </div>
  );
}
