import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  AudioWaveform,
  Cast,
  Check,
  ChevronDown,
  Copy,
  Heart,
  ImageDown,
  Languages,
  ListMusic,
  Loader2,
  Music2,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Sliders,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type {
  AppLanguage,
  ArtworkPalette,
  AudioFxSettings,
  JamRoomState,
  LyricsPayload,
  RepeatMode,
  SongItem,
  VisualSettings,
} from '../types/music';
import { AUDIO_QUALITIES } from '../audio/audioEffectsEngine';
import type { CastStatus } from '../hooks/useGoogleCast';
import { ArtworkImage } from './ArtworkImage';
import { parseLrc } from './LyricsDrawer';
import { exportLyricQuoteCardPng } from '../utils/lyricQuoteCard';

type PlayerSubTab = 'player' | 'lyrics' | 'queue' | 'jam';

interface LastWavePlayerSheetProps {
  open: boolean;
  song: SongItem | null;
  queue: SongItem[];
  isTrackPlaying: boolean;
  trackProgress: number;
  trackDurationSec: number;
  bpm: number;
  timeSignature: string;
  isMetronomePlaying: boolean;
  currentBeatIndex: number;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  isFavorite: boolean;
  audioFx: AudioFxSettings;
  visualSettings: VisualSettings;
  palette: ArtworkPalette;
  language: AppLanguage;
  castStatus: CastStatus;
  castDeviceName: string | null;
  jamRoom: JamRoomState | null;
  jamLoading: boolean;
  jamError: string | null;
  onClose: () => void;
  onToggleTrackPlay: () => void;
  onSeekRatio: (ratio: number) => void;
  onSeekTimeSec: (sec: number) => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleFavorite: (song: SongItem) => void;
  onPlayFromQueue: (song: SongItem, idx: number) => void;
  onMoveQueueItem: (idx: number, dir: -1 | 1) => void;
  onRemoveQueueItem: (idx: number) => void;
  onClearQueue: () => void;
  onOpenMetronome: () => void;
  onOpenAudioSettings: () => void;
  onCastAction: () => void;
  onCreateJamRoom: () => void;
  onJoinJamRoom: (code: string) => void;
  onLeaveJamRoom: () => void;
}

export function LastWavePlayerSheet({
  open,
  song,
  queue,
  isTrackPlaying,
  trackProgress,
  trackDurationSec,
  bpm,
  timeSignature,
  isMetronomePlaying,
  currentBeatIndex,
  shuffleEnabled,
  repeatMode,
  isFavorite,
  audioFx,
  visualSettings,
  palette,
  language,
  castStatus,
  castDeviceName,
  jamRoom,
  jamLoading,
  jamError,
  onClose,
  onToggleTrackPlay,
  onSeekRatio,
  onSeekTimeSec,
  onPrevTrack,
  onNextTrack,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  onPlayFromQueue,
  onMoveQueueItem,
  onRemoveQueueItem,
  onClearQueue,
  onOpenMetronome,
  onOpenAudioSettings,
  onCastAction,
  onCreateJamRoom,
  onJoinJamRoom,
  onLeaveJamRoom,
}: LastWavePlayerSheetProps) {
  const [subTab, setSubTab] = useState<PlayerSubTab>('player');
  const [lyrics, setLyrics] = useState<LyricsPayload | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [secondaryLines, setSecondaryLines] = useState<string[] | null>(null);
  const [secondaryMode, setSecondaryMode] = useState<'translate' | 'romanize' | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [exportingPng, setExportingPng] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedJamLink, setCopiedJamLink] = useState(false);

  useEffect(() => {
    if (!open || !song) return;
    let cancelled = false;
    setLyricsLoading(true);
    setLyricsError(null);
    setSecondaryLines(null);
    setSecondaryMode(null);
    setTranslateError(null);

    const params = new URLSearchParams({
      title: song.title,
      artist: song.artist,
      album: song.album || '',
      duration: String(Math.round((song.durationMs || 180000) / 1000)),
    });

    void fetch(`/api/music/lyrics?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Testo non disponibile per questo brano.');
        return (await res.json()) as LyricsPayload;
      })
      .then((data) => {
        if (!cancelled) setLyrics(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLyrics(null);
          setLyricsError(err instanceof Error ? err.message : 'Testo non disponibile.');
        }
      })
      .finally(() => {
        if (!cancelled) setLyricsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, song?.id, song?.title, song?.artist]);

  const syncedLines = useMemo(() => parseLrc(lyrics?.syncedLyrics || null), [lyrics?.syncedLyrics]);
  const plainLines = useMemo(
    () =>
      lyrics?.plainLyrics
        ? lyrics.plainLyrics
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
        : [],
    [lyrics?.plainLyrics]
  );

  const currentSec = trackProgress * trackDurationSec;
  const activeLyricIndex = useMemo(() => {
    if (syncedLines.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < syncedLines.length; i++) {
      if (currentSec >= syncedLines[i].timeSec) idx = i;
      else break;
    }
    return idx;
  }, [syncedLines, currentSec]);

  if (!open) return null;

  const qualityMeta = AUDIO_QUALITIES[audioFx.quality] || AUDIO_QUALITIES['master-192'];
  const accentHex = visualSettings.customAccentHex || palette.primary || '#C6F100';

  const formatTime = (sec: number) => {
    const safe = Math.max(0, Math.round(sec));
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
  };

  const handleTransformLyrics = async (mode: 'translate' | 'romanize') => {
    if (secondaryMode === mode && secondaryLines) {
      setSecondaryMode(null);
      setSecondaryLines(null);
      return;
    }
    const baseLines = syncedLines.length > 0 ? syncedLines.map((l) => l.text) : plainLines;
    if (baseLines.length === 0 || translating) return;
    setTranslating(true);
    setTranslateError(null);
    try {
      const res = await fetch('/api/music/lyrics-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: baseLines.slice(0, 60),
          mode,
          targetLang: language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore traduzione.');
      setSecondaryLines(Array.isArray(data.lines) ? data.lines : []);
      setSecondaryMode(mode);
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : 'Traduzione non disponibile.');
    } finally {
      setTranslating(false);
    }
  };

  const handleExportPng = async () => {
    if (!song) return;
    const lines =
      syncedLines.length > 0
        ? syncedLines
            .slice(Math.max(0, activeLyricIndex >= 0 ? activeLyricIndex : 0), Math.max(0, activeLyricIndex) + 3)
            .map((l) => l.text)
        : plainLines.slice(0, 3);
    if (lines.length === 0) return;
    setExportingPng(true);
    try {
      await exportLyricQuoteCardPng(song, lines, palette);
    } finally {
      setExportingPng(false);
    }
  };

  const handleCopyJamInvite = async () => {
    if (!jamRoom || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('jam', jamRoom.code);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedJamLink(true);
      window.setTimeout(() => setCopiedJamLink(false), 2000);
    } catch {
      // Ignore
    }
  };

  const beatPulse = isMetronomePlaying && currentBeatIndex === 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#080A07] text-[#EEF1E6] flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="LastWave Liquid Player"
    >
      {/* Dynamic Liquid Artwork Blurred Canvas Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {song?.artworkUrl ? (
          <img
            src={song.artworkUrl}
            alt=""
            className={`w-full h-full object-cover scale-125 opacity-35 blur-3xl transition-transform duration-1000 ${
              visualSettings.spotifyCanvasEnabled && isTrackPlaying ? 'scale-150' : ''
            }`}
          />
        ) : null}
        <div
          className="absolute -top-32 -left-24 w-[42rem] h-[42rem] rounded-full blur-3xl opacity-35 transition-all duration-700"
          style={{ background: `radial-gradient(circle, ${accentHex} 0%, transparent 70%)` }}
        />
        <div
          className="absolute -bottom-32 -right-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-35 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${palette.secondary} 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080A07]/60 via-[#080A07]/75 to-[#080A07]/95" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi player"
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0">
          <p className="text-[11px] font-mono tracking-[0.14em] uppercase text-[#C6F100] truncate">
            {qualityMeta.spec} · {audioFx.bitPerfectMode ? 'BIT-PERFECT' : '15-BAND EQ'} · {bpm} BPM
          </p>
          {jamRoom ? (
            <p className="text-[11px] text-[#B8BFAE] mt-0.5 truncate">
              Jam Room {jamRoom.code} · {jamRoom.listenerCount} in ascolto
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onOpenAudioSettings}
          aria-label="Impostazioni Audio"
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </header>

      {/* Segmented Switcher: Player / Testi Live / Coda / Jam */}
      <div className="relative z-10 max-w-md w-full mx-auto px-4 mt-1">
        <div className="grid grid-cols-4 gap-1 p-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
          {(
            [
              { id: 'player', label: 'Player' },
              { id: 'lyrics', label: 'Testi' },
              { id: 'queue', label: `Coda (${queue.length})` },
              { id: 'jam', label: jamRoom ? `Jam · ${jamRoom.listenerCount}` : 'Jam' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSubTab(item.id)}
              className={`py-1.5 px-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap truncate cursor-pointer ${
                subTab === item.id
                  ? 'bg-[#C6F100] text-[#20251E]'
                  : 'text-[#EEF1E6]/80 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 overflow-y-auto flex flex-col">
        {subTab === 'player' ? (
          <div className="my-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-center">
            {/* Artwork Showcase */}
            <div className="flex flex-col items-center justify-center">
              <div
                className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-[32px] overflow-hidden border border-white/15 shadow-2xl transition-transform duration-200 ${
                  beatPulse ? 'scale-[1.02]' : 'scale-100'
                }`}
              >
                {song ? (
                  <ArtworkImage
                    src={song.artworkUrl}
                    alt={song.title}
                    fallbackLabel={song.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#161912] flex flex-col items-center justify-center gap-3 text-[#B8BFAE]">
                    <AudioWaveform className="w-12 h-12 text-[#C6F100]" />
                    <span className="text-xs font-mono">Seleziona un brano dal catalogo</span>
                  </div>
                )}

                {visualSettings.spotifyCanvasEnabled && isTrackPlaying ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 border-2 border-[#C6F100]/40 rounded-[32px] animate-pulse"
                  />
                ) : null}
              </div>
            </div>

            {/* Track Meta + Scrubbing + Transport Controls */}
            <div className="flex flex-col gap-5 max-w-md w-full mx-auto">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white truncate">
                    {song ? song.title : 'RitmoStudio Free Tempo'}
                  </h2>
                  <p className="text-sm sm:text-base text-[#B8BFAE] truncate mt-1">
                    {song
                      ? `${song.artist} · ${song.album}`
                      : `Metronomo ${bpm} BPM · ${timeSignature}`}
                  </p>
                </div>
                {song ? (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(song)}
                    aria-label="Aggiungi ai preferiti"
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorite ? 'fill-[#C6F100] text-[#C6F100]' : 'text-[#EEF1E6]'
                      }`}
                    />
                  </button>
                ) : null}
              </div>

              {/* Scrubbable Progress Bar */}
              <div className="flex flex-col gap-1.5">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={Math.round(trackProgress * 1000)}
                  onChange={(e) => onSeekRatio(Number(e.target.value) / 1000)}
                  disabled={!song?.previewUrl}
                  aria-label="Posizione riproduzione"
                  className="w-full accent-[#C6F100] cursor-pointer disabled:opacity-40"
                />
                <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[#B8BFAE]">
                  <span>{formatTime(currentSec)}</span>
                  <span>{formatTime(trackDurationSec)}</span>
                </div>
              </div>

              {/* Main Transport Buttons */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onToggleShuffle}
                  aria-label="Shuffle"
                  className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                    shuffleEnabled ? 'bg-[#C6F100]/20 text-[#C6F100]' : 'text-[#B8BFAE] hover:text-white'
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onPrevTrack}
                  aria-label="Traccia precedente"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={onToggleTrackPlay}
                  disabled={!song?.previewUrl}
                  aria-label={isTrackPlaying ? 'Pausa' : 'Riproduci'}
                  className="w-16 h-16 rounded-full bg-[#C6F100] hover:brightness-95 disabled:opacity-40 text-[#20251E] flex items-center justify-center shadow-xl shadow-[#C6F100]/20 transition-transform active:scale-95 cursor-pointer"
                >
                  {isTrackPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onNextTrack}
                  aria-label="Prossima traccia"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={onCycleRepeat}
                  aria-label="Ripeti"
                  className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                    repeatMode !== 'off'
                      ? 'bg-[#C6F100]/20 text-[#C6F100]'
                      : 'text-[#B8BFAE] hover:text-white'
                  }`}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-4 h-4" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Quick Actions Footer inside Player */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSubTab('lyrics')}
                  className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Music2 className="w-3.5 h-3.5 text-[#C6F100]" />
                  <span>Testi Live</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenMetronome}
                  className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <AudioWaveform className="w-3.5 h-3.5 text-[#C6F100]" />
                  <span>{bpm} BPM · Sync</span>
                </button>

                <button
                  type="button"
                  onClick={onCastAction}
                  className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Cast className="w-3.5 h-3.5 text-[#C6F100]" />
                  <span>
                    {castStatus === 'connected' && castDeviceName ? castDeviceName : 'Cast'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {subTab === 'lyrics' ? (
          <div className="flex-1 flex flex-col rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-mono text-[#C6F100] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LRCLIB MILLISECOND SYNC · TOCCA UN VERSO PER SALTARE</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={!lyrics || translating}
                  onClick={() => void handleTransformLyrics('translate')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                    secondaryMode === 'translate'
                      ? 'bg-[#C6F100] text-[#20251E]'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Traduci</span>
                </button>
                <button
                  type="button"
                  disabled={!lyrics || translating}
                  onClick={() => void handleTransformLyrics('romanize')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                    secondaryMode === 'romanize'
                      ? 'bg-[#C6F100] text-[#20251E]'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  Romanizza
                </button>
                <button
                  type="button"
                  disabled={!lyrics || exportingPng}
                  onClick={() => void handleExportPng()}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {exportingPng ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C6F100]" />
                  ) : (
                    <ImageDown className="w-3.5 h-3.5 text-[#C6F100]" />
                  )}
                  <span>Quote Card PNG</span>
                </button>
              </div>
            </div>

            {translateError ? (
              <div className="px-5 py-2 bg-[#D97706]/20 text-xs text-[#FCD34D]">
                {translateError}
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-center">
              {lyricsLoading ? (
                <div className="h-full flex items-center justify-center gap-2 text-sm text-[#B8BFAE]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#C6F100]" />
                  <span>Caricamento testo live...</span>
                </div>
              ) : lyricsError ? (
                <p className="text-sm text-[#B8BFAE] py-12">{lyricsError}</p>
              ) : syncedLines.length > 0 ? (
                syncedLines.map((line, i) => {
                  const isCurrent = i === activeLyricIndex;
                  return (
                    <button
                      key={`${line.timeSec}-${i}`}
                      type="button"
                      onClick={() => onSeekTimeSec(line.timeSec)}
                      className="block w-full text-center cursor-pointer"
                    >
                      <p
                        className={`text-xl sm:text-2xl font-bold transition-all ${
                          isCurrent ? 'text-[#C6F100] scale-[1.02]' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {line.text}
                      </p>
                      {secondaryLines?.[i] ? (
                        <p className="text-xs sm:text-sm text-[#B8BFAE] mt-1">
                          {secondaryLines[i]}
                        </p>
                      ) : null}
                    </button>
                  );
                })
              ) : plainLines.length > 0 ? (
                plainLines.map((line, i) => (
                  <div key={i}>
                    <p className="text-lg font-semibold text-white/85">{line}</p>
                    {secondaryLines?.[i] ? (
                      <p className="text-xs text-[#B8BFAE] mt-0.5">{secondaryLines[i]}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#B8BFAE] py-12">Nessun testo disponibile.</p>
              )}
            </div>
          </div>
        ) : null}

        {subTab === 'queue' ? (
          <div className="flex-1 flex flex-col rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-[#C6F100]" />
                <span className="text-sm font-bold">Prossimi brani in coda ({queue.length})</span>
              </div>
              {queue.length > 0 ? (
                <button
                  type="button"
                  onClick={onClearQueue}
                  className="text-xs text-[#B8BFAE] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Svuota coda</span>
                </button>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/10">
              {queue.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#B8BFAE]">
                  La coda è vuota. Tocca &ldquo;+ Coda&rdquo; su qualsiasi brano del catalogo o attiva
                  la riproduzione automatica.
                </div>
              ) : (
                queue.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-white/5"
                  >
                    <span className="text-xs font-mono text-[#B8BFAE] w-5 text-right">{idx + 1}</span>
                    <ArtworkImage
                      src={item.artworkUrl}
                      alt={item.title}
                      fallbackLabel={item.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => onPlayFromQueue(item, idx)}
                      className="flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      <p className="text-xs text-[#B8BFAE] truncate">{item.artist}</p>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => onMoveQueueItem(idx, -1)}
                        aria-label="Sposta su"
                        className="p-1.5 rounded-full bg-white/10 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === queue.length - 1}
                        onClick={() => onMoveQueueItem(idx, 1)}
                        aria-label="Sposta giù"
                        className="p-1.5 rounded-full bg-white/10 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveQueueItem(idx)}
                        aria-label="Rimuovi dalla coda"
                        className="p-1.5 rounded-full bg-white/10 hover:bg-[#DC2626]/40 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        {subTab === 'jam' ? (
          <div className="my-auto max-w-lg w-full mx-auto rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl p-6 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#C6F100] text-[#20251E] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">LastWave Jam · Ascolta Insieme</h3>
                <p className="text-xs text-[#B8BFAE] mt-0.5">
                  Crea una stanza sincronizzata in tempo reale: brano attivo, posizione, BPM e
                  coda condivisi con gli amici.
                </p>
              </div>
            </div>

            {jamError ? (
              <p className="text-xs text-[#FCA5A5] bg-[#DC2626]/20 border border-[#DC2626]/30 rounded-xl px-3.5 py-2">
                {jamError}
              </p>
            ) : null}

            {jamRoom ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-[#C6F100]/30 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#C6F100]">
                      ROOM ATTIVA · {jamRoom.listenerCount} PARTECIPANTI
                    </p>
                    <p className="text-2xl font-mono font-bold tracking-wider text-white mt-0.5">
                      {jamRoom.code}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopyJamInvite()}
                    className="px-4 py-2 rounded-full bg-[#C6F100] text-[#20251E] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedJamLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Link copiato</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Invita</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-[#B8BFAE] px-1">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#C6F100]" />
                    <span>
                      Brano sync: {jamRoom.song?.title || 'In attesa'} · {jamRoom.bpm} BPM
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={onLeaveJamRoom}
                    className="text-[#FCA5A5] hover:underline font-semibold cursor-pointer"
                  >
                    Esci dalla Jam
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  disabled={jamLoading}
                  onClick={onCreateJamRoom}
                  className="w-full py-3 rounded-full bg-[#C6F100] hover:brightness-95 text-[#20251E] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {jamLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  <span>Avvia Nuova Jam Room</span>
                </button>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (joinCodeInput.trim()) onJoinJamRoom(joinCodeInput.trim());
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Codice Jam (es. LW-8K2M)"
                    className="flex-1 rounded-full bg-black/40 border border-white/15 px-4 py-2.5 text-sm font-mono text-white placeholder:text-[#B8BFAE]/60"
                  />
                  <button
                    type="submit"
                    disabled={jamLoading || !joinCodeInput.trim()}
                    className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-40 text-xs font-bold text-white cursor-pointer"
                  >
                    Entra
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
