import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  Check,
  Copy,
  ImageDown,
  Languages,
  Loader2,
  Music2,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  AppLanguage,
  ArtworkPalette,
  LyricsPayload,
  SongItem,
  VisualSettings,
} from '../types/music';
import { exportLyricQuoteCardPng } from '../utils/lyricQuoteCard';

export interface ParsedLrcLine {
  timeSec: number;
  text: string;
}

export function parseLrc(lrc: string | null): ParsedLrcLine[] {
  if (!lrc) return [];
  const lines: ParsedLrcLine[] = [];
  const regex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)/;

  for (const rawLine of lrc.split('\n')) {
    const match = rawLine.match(regex);
    if (!match) continue;
    const min = Number(match[1]);
    const sec = Number(match[2]);
    const fracRaw = match[3] || '0';
    const frac = Number(fracRaw) / Math.pow(10, fracRaw.length);
    const text = match[4]?.trim() || '';
    if (!text) continue;
    lines.push({
      timeSec: min * 60 + sec + frac,
      text,
    });
  }

  return lines.sort((a, b) => a.timeSec - b.timeSec);
}

interface LyricsDrawerProps {
  open: boolean;
  song: SongItem | null;
  currentTimeSec: number;
  language: AppLanguage;
  palette: ArtworkPalette;
  visualSettings: VisualSettings;
  onChangeVisualSettings: (next: VisualSettings) => void;
  onSeekTimeSec?: (sec: number) => void;
  onClose: () => void;
}

export function LyricsDrawer({
  open,
  song,
  currentTimeSec,
  language,
  palette,
  visualSettings,
  onChangeVisualSettings,
  onSeekTimeSec,
  onClose,
}: LyricsDrawerProps) {
  const [lyrics, setLyrics] = useState<LyricsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);
  const [secondaryLines, setSecondaryLines] = useState<string[] | null>(null);
  const [secondaryMode, setSecondaryMode] = useState<'translate' | 'romanize' | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open || !song) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
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
        if (!cancelled) {
          setLyrics(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLyrics(null);
          setError(err instanceof Error ? err.message : 'Testo non disponibile.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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

  const activeIndex = useMemo(() => {
    if (syncedLines.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < syncedLines.length; i++) {
      if (currentTimeSec >= syncedLines[i].timeSec) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [syncedLines, currentTimeSec]);

  useEffect(() => {
    if (!visualSettings.lyricsAutoScroll) return;
    activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex, visualSettings.lyricsAutoScroll]);

  if (!open) return null;

  const sizeClass =
    visualSettings.lyricsFontSize === 'sm'
      ? 'text-base sm:text-lg'
      : visualSettings.lyricsFontSize === 'lg'
        ? 'text-2xl sm:text-3xl'
        : 'text-xl sm:text-2xl';

  const getActiveQuoteLines = (): string[] => {
    if (syncedLines.length > 0) {
      const start = Math.max(0, activeIndex >= 0 ? activeIndex : 0);
      return syncedLines.slice(start, start + 3).map((l) => l.text);
    }
    return plainLines.slice(0, 3);
  };

  const handleCopyQuote = async () => {
    const activeText = getActiveQuoteLines().join(' / ');
    if (!activeText || !song) return;
    try {
      await navigator.clipboard.writeText(`“${activeText}” — ${song.title} · ${song.artist}`);
      setCopiedQuote(true);
      window.setTimeout(() => setCopiedQuote(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleExportQuotePng = async () => {
    if (!song) return;
    const lines = getActiveQuoteLines();
    if (lines.length === 0) return;
    setExportingPng(true);
    try {
      await exportLyricQuoteCardPng(song, lines, palette);
    } finally {
      setExportingPng(false);
    }
  };

  const handleTransformLyrics = async (mode: 'translate' | 'romanize') => {
    if (secondaryMode === mode && secondaryLines) {
      setSecondaryMode(null);
      setSecondaryLines(null);
      return;
    }
    const baseLines =
      syncedLines.length > 0 ? syncedLines.map((l) => l.text) : plainLines;
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

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0E100C]/85 backdrop-blur-xl flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Testi sincronizzati LRCLIB"
    >
      <div className="w-full max-w-2xl h-[84vh] rounded-[26px] border border-[#2C3027] bg-[#0E100C] text-[#EEF1E6] flex flex-col overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="px-5 py-4 border-b border-[#2C3027] flex flex-wrap items-center justify-between gap-3 bg-[#161912]">
          <div className="min-w-0">
            <p className="text-[10px] font-mono tracking-[0.18em] uppercase text-[#C6F100] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>LRCLIB LIVE SYNCED LYRICS</span>
            </p>
            <h2 className="text-base font-bold truncate mt-0.5">
              {song ? `${song.title} — ${song.artist}` : 'Nessun brano attivo'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={!lyrics || translating}
              onClick={() => void handleTransformLyrics('translate')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                secondaryMode === 'translate'
                  ? 'bg-[#C6F100] text-[#20251E] font-bold'
                  : 'bg-white/5 hover:bg-white/15 text-[#EEF1E6]'
              }`}
            >
              {translating && secondaryMode !== 'romanize' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Languages className="w-3.5 h-3.5" />
              )}
              <span>Traduci</span>
            </button>

            <button
              type="button"
              disabled={!lyrics || translating}
              onClick={() => void handleTransformLyrics('romanize')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer disabled:opacity-40 ${
                secondaryMode === 'romanize'
                  ? 'bg-[#C6F100] text-[#20251E] font-bold'
                  : 'bg-white/5 hover:bg-white/15 text-[#EEF1E6]'
              }`}
            >
              Romanizza
            </button>

            <button
              type="button"
              onClick={() =>
                onChangeVisualSettings({
                  ...visualSettings,
                  lyricsCenterAlign: !visualSettings.lyricsCenterAlign,
                })
              }
              aria-label="Toggle lyrics alignment"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-[#B8BFAE] hover:text-white cursor-pointer"
            >
              {visualSettings.lyricsCenterAlign ? (
                <AlignCenter className="w-4 h-4 text-[#C6F100]" />
              ) : (
                <AlignLeft className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => void handleExportQuotePng()}
              disabled={!lyrics || exportingPng}
              title="Esporta Quote Card PNG"
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-40 text-xs font-medium text-[#EEF1E6] flex items-center gap-1.5 cursor-pointer"
            >
              {exportingPng ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C6F100]" />
              ) : (
                <ImageDown className="w-3.5 h-3.5 text-[#C6F100]" />
              )}
              <span>Card PNG</span>
            </button>

            <button
              type="button"
              onClick={() => void handleCopyQuote()}
              disabled={!lyrics}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-40 text-xs font-medium text-[#EEF1E6] flex items-center gap-1.5 cursor-pointer"
            >
              {copiedQuote ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C6F100]" />
                  <span>Copiata</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Testo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#EEF1E6] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {translateError ? (
          <div className="px-5 py-2 bg-[#D97706]/15 border-b border-[#D97706]/30 text-xs text-[#FCD34D]">
            {translateError}
          </div>
        ) : null}

        {/* Lyrics Scroll Area */}
        <div
          className={`flex-1 overflow-y-auto px-6 py-8 space-y-4 ${
            visualSettings.lyricsCenterAlign ? 'text-center' : 'text-left'
          }`}
        >
          {!song ? (
            <div className="h-full flex flex-col items-center justify-center text-[#B8BFAE] gap-2">
              <Music2 className="w-10 h-10 text-[#C6F100]" />
              <p className="text-sm">Seleziona una canzone per visualizzare il testo sincronizzato.</p>
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center text-[#B8BFAE] gap-2.5">
              <Loader2 className="w-6 h-6 animate-spin text-[#C6F100]" />
              <p className="text-xs font-mono">Ricerca testo sincronizzato LRCLIB...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-[#B8BFAE] gap-2">
              <Music2 className="w-8 h-8 opacity-60" />
              <p className="text-sm">{error}</p>
            </div>
          ) : lyrics?.instrumental ? (
            <div className="h-full flex items-center justify-center text-[#C6F100] font-mono text-sm">
              ✳ Brano Strumentale
            </div>
          ) : syncedLines.length > 0 ? (
            syncedLines.map((line, i) => {
              const isCurrent = i === activeIndex;
              const isPast = i < activeIndex;
              const translated = secondaryLines?.[i];
              return (
                <button
                  key={`${line.timeSec}-${i}`}
                  type="button"
                  ref={isCurrent ? activeLineRef : undefined}
                  onClick={() => onSeekTimeSec?.(line.timeSec)}
                  className={`block w-full ${
                    visualSettings.lyricsCenterAlign ? 'text-center' : 'text-left'
                  } cursor-pointer group`}
                >
                  <p
                    className={`${sizeClass} font-bold tracking-tight leading-snug transition-all duration-300 ${
                      isCurrent
                        ? 'text-[#C6F100] scale-[1.02]'
                        : isPast
                          ? 'text-[#EEF1E6]/45 group-hover:text-[#EEF1E6]/80'
                          : 'text-[#EEF1E6]/75 group-hover:text-white'
                    }`}
                  >
                    {line.text}
                  </p>
                  {translated ? (
                    <p className="text-sm font-medium text-[#B8BFAE] mt-1">{translated}</p>
                  ) : null}
                </button>
              );
            })
          ) : plainLines.length > 0 ? (
            plainLines.map((line, i) => (
              <div key={i}>
                <p className={`${sizeClass} font-semibold text-[#EEF1E6]/85 leading-relaxed`}>
                  {line}
                </p>
                {secondaryLines?.[i] ? (
                  <p className="text-sm font-medium text-[#B8BFAE] mt-0.5">{secondaryLines[i]}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-[#B8BFAE]">Nessun testo disponibile.</p>
          )}
        </div>
      </div>
    </div>
  );
}
