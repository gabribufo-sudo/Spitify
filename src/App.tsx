import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioWaveform,
  Download,
  Pause,
  Play,
  RefreshCw,
  Sliders,
  Square,
  X,
} from 'lucide-react';
import type {
  AlbumDetail,
  AlbumItem,
  AppLanguage,
  ArtworkPalette,
  AudioFxSettings,
  ChatMessage,
  ClickSound,
  GeneratedCover,
  GroundingSource,
  ListeningEntry,
  Playlist,
  SongItem,
  Subdivision,
  VisualSettings,
} from './types/music';
import { LANGUAGES, LOCALE_MAP, TRANSLATIONS } from './i18n/translations';
import {
  analyzeAudioBufferTempo,
  MetronomeEngine,
} from './audio/metronomeEngine';
import {
  AudioEffectsChain,
  DEFAULT_AUDIO_FX,
  extractPaletteFromArtwork,
} from './audio/audioEffectsEngine';
import {
  downloadSongSpatialAtmos,
  fetchCachedPreviewBuffer,
} from './audio/spatialExporter';
import { useGoogleCast } from './hooks/useGoogleCast';
import { usePWAInstall } from './hooks/usePWAInstall';
import { ArtworkImage } from './components/ArtworkImage';
import { MetronomeHardware } from './components/MetronomeHardware';
import { CatalogView, type SearchFilters } from './components/CatalogView';
import { PlaylistView } from './components/PlaylistView';
import { HistoryStatsView } from './components/HistoryStatsView';
import { CoverStudioView } from './components/CoverStudioView';
import { MusicChatView } from './components/MusicChatView';
import {
  DEFAULT_VISUAL_SETTINGS,
  LiquidStudioView,
  type LastWaveSettingsSection,
} from './components/LiquidStudioView';
import { LyricsDrawer } from './components/LyricsDrawer';
import { ShareModal, type ShareTarget } from './components/ShareModal';
import { OfflineIndicator } from './components/PWAInstallButton';

type AppTab = 'releases' | 'catalog' | 'playlists' | 'history' | 'studio';

const PLAYLISTS_STORAGE_KEY = 'ritmostudio_playlists_v1';
const HISTORY_STORAGE_KEY = 'ritmostudio_history_v1';
const LANG_STORAGE_KEY = 'ritmostudio_lang_v1';
const AUDIO_FX_STORAGE_KEY = 'ritmostudio_audio_fx_v1';
const VISUAL_SETTINGS_STORAGE_KEY = 'ritmostudio_visual_settings_v1';

const DEFAULT_FILTERS: SearchFilters = {
  q: '',
  artist: '',
  album: '',
  genre: 'Tutti',
  year: '',
};

function loadInitialLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'it' || saved === 'en' || saved === 'es' || saved === 'fr' || saved === 'de') {
      return saved;
    }
  } catch {
    // Ignore storage error
  }
  return 'it';
}

function loadInitialPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage error
  }
  return [
    {
      id: 'pl-default-1',
      name: 'Prove & Studio BPM',
      description: 'Raccolta personale per esercitarsi a tempo con il metronomo.',
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
}

function loadInitialHistory(): ListeningEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage error
  }
  return [];
}

function loadInitialAudioFx(): AudioFxSettings {
  try {
    const raw = localStorage.getItem(AUDIO_FX_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_AUDIO_FX,
          ...parsed,
          eq15Bands:
            Array.isArray(parsed.eq15Bands) && parsed.eq15Bands.length === 15
              ? parsed.eq15Bands
              : [...DEFAULT_AUDIO_FX.eq15Bands],
        };
      }
    }
  } catch {
    // Ignore storage error
  }
  return DEFAULT_AUDIO_FX;
}

function loadInitialVisualSettings(): VisualSettings {
  try {
    const raw = localStorage.getItem(VISUAL_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_VISUAL_SETTINGS, ...parsed };
      }
    }
  } catch {
    // Ignore storage error
  }
  return DEFAULT_VISUAL_SETTINGS;
}

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>(loadInitialLanguage);
  const t = TRANSLATIONS[language];
  const locale = LOCALE_MAP[language];

  const [activeTab, setActiveTab] = useState<AppTab>('releases');
  const [settingsSection, setSettingsSection] = useState<LastWaveSettingsSection>('audio');
  const [country, setCountry] = useState<'it' | 'us'>('it');

  // Feed & Search state
  const [feedSongs, setFeedSongs] = useState<SongItem[]>([]);
  const [feedAlbums, setFeedAlbums] = useState<AlbumItem[]>([]);
  const [searchSongs, setSearchSongs] = useState<SongItem[]>([]);
  const [searchAlbums, setSearchAlbums] = useState<AlbumItem[]>([]);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [lastUpdatedIso, setLastUpdatedIso] = useState<string | null>(null);
  const [secondsToNextSync, setSecondsToNextSync] = useState(60);

  // Album detail drawer
  const [selectedAlbumDetail, setSelectedAlbumDetail] = useState<AlbumDetail | null>(null);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);

  // Web Discovery
  const [webDiscovery, setWebDiscovery] = useState<{
    summary: string;
    sources: GroundingSource[];
    discoveredAt: string;
  } | null>(null);
  const [isDiscoveringWeb, setIsDiscoveringWeb] = useState(false);
  const [webDiscoveryError, setWebDiscoveryError] = useState<string | null>(null);

  // Metronome & Audio Playback state
  const [activeSong, setActiveSong] = useState<SongItem | null>(null);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [subdivision, setSubdivision] = useState<Subdivision>(1);
  const [clickSound, setClickSound] = useState<ClickSound>('wood');
  const [accentBeatOne, setAccentBeatOne] = useState(true);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [metronomeVolume, setMetronomeVolume] = useState(0.75);
  const [trackVolume, setTrackVolume] = useState(0.8);
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackDurationSec, setTrackDurationSec] = useState(30);
  const [bpmSourceLabel, setBpmSourceLabel] = useState(t.metronome.manualTempo);

  // Metronome Rack Drawer, Lyrics Drawer & Sleep Timer
  const [mobileMetronomeOpen, setMobileMetronomeOpen] = useState(false);
  const [lyricsDrawerOpen, setLyricsDrawerOpen] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(0);
  const [sleepRemainingSec, setSleepRemainingSec] = useState<number | null>(null);
  const pwaInstall = usePWAInstall();

  // Playlists, History, Spatial Download, Sharing, Covers & Chat state
  const [playlists, setPlaylists] = useState<Playlist[]>(loadInitialPlaylists);
  const [historyEntries, setHistoryEntries] = useState<ListeningEntry[]>(loadInitialHistory);
  const [downloadingSongId, setDownloadingSongId] = useState<string | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [covers, setCovers] = useState<GeneratedCover[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Liquid Audio FX, Screen Customization, Dynamic Artwork Palette & Google Cast
  const [audioFx, setAudioFx] = useState<AudioFxSettings>(loadInitialAudioFx);
  const [visualSettings, setVisualSettings] = useState<VisualSettings>(loadInitialVisualSettings);
  const [artworkPalette, setArtworkPalette] = useState<ArtworkPalette>({
    primary: '#C6F100',
    secondary: '#536716',
    glow: '#DDF95E',
  });
  const googleCast = useGoogleCast();

  // Audio Refs
  const engineRef = useRef<MetronomeEngine | null>(null);
  const effectsChainRef = useRef<AudioEffectsChain | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const sourceEnvGainRef = useRef<GainNode | null>(null);
  const trackStartTimeRef = useRef<number>(0);
  const trackOffsetRef = useRef<number>(0);
  const trackBufferPosRef = useRef<number>(0);
  const lastProgressCtxTimeRef = useRef<number>(0);
  const audioFxRef = useRef<AudioFxSettings>(audioFx);
  const playbackRateRef = useRef<number>(audioFx.playbackRate);
  const firstBeatOffsetRef = useRef<number>(0);
  const tapTimesRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);

  if (!engineRef.current) {
    engineRef.current = new MetronomeEngine();
  }
  if (!effectsChainRef.current) {
    effectsChainRef.current = new AudioEffectsChain();
  }

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setOnTick((ev) => {
      setCurrentBeatIndex(ev.beatIndex);
      if (
        ev.beatIndex === 0 &&
        ev.isAccent &&
        visualSettings.hapticBeatEnabled &&
        typeof navigator !== 'undefined' &&
        'vibrate' in navigator
      ) {
        try {
          navigator.vibrate(14);
        } catch {
          // Ignore unsupported haptic vibrate
        }
      }
    });
    return () => {
      engine.stop();
    };
  }, [visualSettings.hapticBeatEnabled]);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // Ignore storage error
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    } catch {
      // Ignore storage error
    }
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyEntries));
    } catch {
      // Ignore storage error
    }
  }, [historyEntries]);

  useEffect(() => {
    audioFxRef.current = audioFx;
    playbackRateRef.current = audioFx.playbackRate;
    effectsChainRef.current?.applySettings(audioFx);
    if (audioSourceRef.current && engineRef.current) {
      try {
        const ctx = engineRef.current.ensureContext();
        audioSourceRef.current.playbackRate.setTargetAtTime(audioFx.playbackRate, ctx.currentTime, 0.02);
      } catch {
        // Ignore if source already stopped
      }
    }
    try {
      localStorage.setItem(AUDIO_FX_STORAGE_KEY, JSON.stringify(audioFx));
    } catch {
      // Ignore storage error
    }
  }, [audioFx]);

  useEffect(() => {
    const isDarkTheme = visualSettings.theme !== 'studio-light';
    const isAmoled = visualSettings.theme === 'amoled-black';
    document.documentElement.classList.toggle('dark', isDarkTheme);
    document.documentElement.classList.toggle('amoled', isAmoled);
    const activeAccent = visualSettings.customAccentHex || artworkPalette.primary;
    document.documentElement.style.setProperty('--ritmo-accent', activeAccent);
    document.documentElement.style.setProperty('--ritmo-secondary', artworkPalette.secondary);
    document.documentElement.style.setProperty('--ritmo-glow', artworkPalette.glow);
    document.documentElement.style.setProperty('--ritmo-glass-blur', `${visualSettings.glassBlurPx}px`);
    try {
      localStorage.setItem(VISUAL_SETTINGS_STORAGE_KEY, JSON.stringify(visualSettings));
    } catch {
      // Ignore storage error
    }
  }, [artworkPalette, visualSettings]);

  useEffect(() => {
    let cancelled = false;
    const seed = activeSong ? `${activeSong.artist}-${activeSong.title}` : 'ritmostudio-stage';
    void extractPaletteFromArtwork(activeSong?.artworkUrl, seed).then((palette) => {
      if (!cancelled) setArtworkPalette(palette);
    });
    return () => {
      cancelled = true;
    };
  }, [activeSong?.artworkUrl, activeSong?.artist, activeSong?.title]);

  const recordListeningHistory = useCallback((song: SongItem, syncedBpm: number) => {
    setHistoryEntries((prev) => {
      const existingIdx = prev.findIndex((e) => e.song.id === song.id);
      const now = Date.now();
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const updated: ListeningEntry = {
          ...existing,
          song: { ...song, bpm: syncedBpm },
          playedAt: now,
          playCount: existing.playCount + 1,
          bpmSynced: syncedBpm,
        };
        const rest = prev.filter((_, idx) => idx !== existingIdx);
        return [updated, ...rest].slice(0, 120);
      }
      const created: ListeningEntry = {
        id: `hist-${now}-${song.id}`,
        song: { ...song, bpm: syncedBpm },
        playedAt: now,
        playCount: 1,
        bpmSynced: syncedBpm,
      };
      return [created, ...prev].slice(0, 120);
    });
  }, []);

  const fetchFeed = useCallback(
    async (targetCountry: 'it' | 'us' = country) => {
      setIsLoadingFeed(true);
      try {
        const res = await fetch(`/api/music/feed?country=${targetCountry}`);
        if (!res.ok) throw new Error('Feed error');
        const data = await res.json();
        setFeedSongs(Array.isArray(data.songs) ? data.songs : []);
        setFeedAlbums(Array.isArray(data.albums) ? data.albums : []);
        setLastUpdatedIso(data.fetchedAt || new Date().toISOString());
        setSecondsToNextSync(60);
      } catch {
        // Keep existing feed on transient error
      } finally {
        setIsLoadingFeed(false);
      }
    },
    [country]
  );

  useEffect(() => {
    void fetchFeed(country);
  }, [country, fetchFeed]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsToNextSync((prev) => {
        if (prev <= 1) {
          void fetchFeed(country);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [country, fetchFeed]);

  const stopAudioPreview = useCallback((crossfadeOutSec = 0) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const prevSource = audioSourceRef.current;
    const prevEnv = sourceEnvGainRef.current;
    audioSourceRef.current = null;
    sourceEnvGainRef.current = null;

    if (prevSource) {
      prevSource.onended = null;
      if (crossfadeOutSec > 0.1 && prevEnv && engineRef.current) {
        try {
          const ctx = engineRef.current.ensureContext();
          const now = ctx.currentTime;
          prevEnv.gain.cancelScheduledValues(now);
          prevEnv.gain.setValueAtTime(Math.max(0.01, prevEnv.gain.value), now);
          prevEnv.gain.exponentialRampToValueAtTime(0.001, now + crossfadeOutSec);
          prevSource.stop(now + crossfadeOutSec + 0.05);
          window.setTimeout(() => {
            try {
              prevSource.disconnect();
              prevEnv.disconnect();
            } catch {
              // Ignore cleanup
            }
          }, Math.ceil((crossfadeOutSec + 0.15) * 1000));
        } catch {
          try {
            prevSource.stop();
            prevSource.disconnect();
          } catch {
            // Ignore
          }
        }
      } else {
        try {
          prevSource.stop();
          prevSource.disconnect();
          prevEnv?.disconnect();
        } catch {
          // Ignore already stopped
        }
      }
    }
    setIsTrackPlaying(false);
  }, []);

  const handleSetSleepTimer = useCallback((minutes: number) => {
    setSleepTimerMinutes(minutes);
    setSleepRemainingSec(minutes > 0 ? minutes * 60 : null);
  }, []);

  useEffect(() => {
    if (sleepRemainingSec === null) return;
    const timer = window.setInterval(() => {
      setSleepRemainingSec((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          stopAudioPreview(0);
          engineRef.current?.stop();
          setIsMetronomePlaying(false);
          setSleepTimerMinutes(0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sleepRemainingSec !== null, stopAudioPreview]);

  const playDecodedBuffer = useCallback(
    (buffer: AudioBuffer, startOffsetSec = 0, allowCrossfade = false) => {
      const engine = engineRef.current;
      const fxChain = effectsChainRef.current;
      if (!engine || !fxChain) return;
      const ctx = engine.ensureContext();

      const useAutomix =
        allowCrossfade &&
        audioFxRef.current.automixEnabled &&
        audioFxRef.current.crossfadeSec > 0 &&
        !audioFxRef.current.bitPerfectMode;
      const fadeSec = useAutomix
        ? Math.min(audioFxRef.current.crossfadeSec, Math.max(0.4, buffer.duration * 0.2))
        : 0;

      stopAudioPreview(fadeSec);

      const fxInput = fxChain.ensureGraph(ctx, trackVolume, audioFxRef.current);

      const envGain = ctx.createGain();
      const safeOffset = Math.max(0, Math.min(startOffsetSec, buffer.duration - 0.1));
      const startTime = ctx.currentTime + 0.04;

      if (fadeSec > 0.1) {
        envGain.gain.setValueAtTime(0.01, startTime);
        envGain.gain.exponentialRampToValueAtTime(1.0, startTime + fadeSec);
      } else {
        envGain.gain.setValueAtTime(1.0, startTime);
      }
      envGain.connect(fxInput);

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = playbackRateRef.current;
      src.connect(envGain);
      src.start(startTime, safeOffset);

      audioSourceRef.current = src;
      sourceEnvGainRef.current = envGain;
      trackStartTimeRef.current = startTime - safeOffset;
      trackOffsetRef.current = safeOffset;
      trackBufferPosRef.current = safeOffset;
      lastProgressCtxTimeRef.current = startTime;
      setTrackDurationSec(buffer.duration);
      setIsTrackPlaying(true);

      src.onended = () => {
        if (audioSourceRef.current !== src) return;
        setIsTrackPlaying(false);
        setTrackProgress(0);
        trackOffsetRef.current = 0;
        trackBufferPosRef.current = 0;
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };

      const tickProgress = () => {
        if (audioSourceRef.current !== src) return;
        const now = ctx.currentTime;
        if (now > lastProgressCtxTimeRef.current) {
          const dt = now - lastProgressCtxTimeRef.current;
          lastProgressCtxTimeRef.current = now;
          trackBufferPosRef.current += dt * playbackRateRef.current;
        }
        const ratio = Math.min(1, Math.max(0, trackBufferPosRef.current / buffer.duration));
        setTrackProgress(ratio);
        if (ratio < 1) {
          rafRef.current = requestAnimationFrame(tickProgress);
        }
      };
      rafRef.current = requestAnimationFrame(tickProgress);

      if (autoSyncEnabled) {
        const beatAnchor = trackStartTimeRef.current + firstBeatOffsetRef.current;
        engine.start(beatAnchor);
        setIsMetronomePlaying(true);
      }
    },
    [autoSyncEnabled, stopAudioPreview, trackVolume]
  );

  const handleSelectSong = useCallback(
    async (song: SongItem) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.ensureContext();

      const hadActiveAudio = Boolean(audioSourceRef.current);
      if (!hadActiveAudio) {
        stopAudioPreview(0);
      }
      audioBufferRef.current = null;
      setTrackProgress(0);
      setActiveSong(song);

      let resolvedBpm = song.bpm;
      let resolvedTs = song.timeSignature || '4/4';
      let resolvedKey = song.musicalKey || '';
      let sourceText =
        song.bpmSource === 'deezer'
          ? 'Deezer BPM'
          : song.bpmSource === 'audio-dsp'
            ? 'Audio DSP'
            : t.metronome.analyzingBeat;

      if (resolvedBpm && resolvedBpm > 25) {
        setBpm(resolvedBpm);
        engine.setBpm(resolvedBpm);
      }
      setTimeSignature(resolvedTs);
      engine.setTimeSignature(resolvedTs);
      setBpmSourceLabel(sourceText);

      const bpmPromise =
        !resolvedBpm || resolvedBpm <= 25
          ? fetch(
              `/api/music/bpm?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(
                song.artist
              )}&genre=${encodeURIComponent(song.genre)}`
            )
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          : Promise.resolve(null);

      if (song.previewUrl) {
        setIsAnalyzingAudio(true);
        try {
          const [metaResult, arrBuf] = await Promise.all([
            bpmPromise,
            fetchCachedPreviewBuffer(song.previewUrl).catch(() => null),
          ]);

          if (metaResult && typeof metaResult.bpm === 'number' && metaResult.bpm > 0) {
            const metaBpm = metaResult.bpm;
            resolvedBpm = metaBpm;
            resolvedTs = metaResult.timeSignature || '4/4';
            resolvedKey = metaResult.musicalKey || '';
            setBpm(metaBpm);
            engine.setBpm(metaBpm);
            setTimeSignature(resolvedTs);
            engine.setTimeSignature(resolvedTs);
          }

          if (arrBuf) {
            const ctx = engine.ensureContext();
            const decoded = await ctx.decodeAudioData(arrBuf);
            audioBufferRef.current = decoded;

            const dsp = analyzeAudioBufferTempo(decoded);
            firstBeatOffsetRef.current = dsp.firstBeatOffsetSec;

            const finalBpm =
              metaResult?.bpmSource === 'deezer' || song.bpmSource === 'deezer'
                ? resolvedBpm || dsp.bpm
                : dsp.bpm;

            setBpm(finalBpm);
            engine.setBpm(finalBpm);
            setBpmSourceLabel(
              metaResult?.bpmSource === 'deezer' || song.bpmSource === 'deezer'
                ? `Deezer (${finalBpm} BPM) · DSP`
                : `Audio DSP (${finalBpm} BPM · ${Math.round(dsp.confidence * 100)}%)`
            );

            setActiveSong((prev) =>
              prev && prev.id === song.id
                ? {
                    ...prev,
                    bpm: finalBpm,
                    timeSignature: resolvedTs,
                    musicalKey: resolvedKey,
                    bpmSource: 'audio-dsp',
                  }
                : prev
            );

            setFeedSongs((prev) =>
              prev.map((item) => (item.id === song.id ? { ...item, bpm: finalBpm } : item))
            );
            setSearchSongs((prev) =>
              prev.map((item) => (item.id === song.id ? { ...item, bpm: finalBpm } : item))
            );

            recordListeningHistory(song, finalBpm);
            setIsAnalyzingAudio(false);
            playDecodedBuffer(decoded, 0, true);
            return;
          }
        } catch {
          // Fall back cleanly
        } finally {
          setIsAnalyzingAudio(false);
        }
      } else {
        const metaResult = await bpmPromise;
        if (metaResult && typeof metaResult.bpm === 'number' && metaResult.bpm > 0) {
          const metaBpm = metaResult.bpm;
          setBpm(metaBpm);
          engine.setBpm(metaBpm);
          setTimeSignature(metaResult.timeSignature || '4/4');
          engine.setTimeSignature(metaResult.timeSignature || '4/4');
          setBpmSourceLabel(`${metaBpm} BPM (${metaResult.bpmSource})`);
          setActiveSong((prev) =>
            prev && prev.id === song.id
              ? { ...prev, bpm: metaBpm, musicalKey: metaResult.musicalKey }
              : prev
          );
          recordListeningHistory(song, metaBpm);
        } else {
          recordListeningHistory(song, resolvedBpm || bpm);
        }
      }

      if (autoSyncEnabled) {
        engine.start();
        setIsMetronomePlaying(true);
      }
    },
    [autoSyncEnabled, bpm, playDecodedBuffer, recordListeningHistory, stopAudioPreview, t.metronome.analyzingBeat]
  );

  const handleDownloadAtmos = async (song: SongItem) => {
    if (!song.previewUrl || downloadingSongId) return;
    setDownloadingSongId(song.id);
    setDownloadFeedback(null);
    try {
      const preDecoded = activeSong?.id === song.id ? audioBufferRef.current : null;
      const result = await downloadSongSpatialAtmos(song, preDecoded, audioFx);
      const sizeKb = Math.max(1, Math.round(result.bytes / 1024));
      setDownloadFeedback(`${song.title} · Dolby Atmos MP3 (${sizeKb} KB)`);
      window.setTimeout(() => setDownloadFeedback(null), 3500);
    } catch {
      setDownloadFeedback(t.download.atmosUnavailable);
      window.setTimeout(() => setDownloadFeedback(null), 3500);
    } finally {
      setDownloadingSongId(null);
    }
  };

  const handleToggleTrackPlay = () => {
    const engine = engineRef.current;
    const buffer = audioBufferRef.current;
    if (!engine || !buffer) return;

    if (isTrackPlaying) {
      trackOffsetRef.current = Math.max(0, Math.min(buffer.duration - 0.1, trackBufferPosRef.current));
      stopAudioPreview();
    } else {
      playDecodedBuffer(
        buffer,
        trackOffsetRef.current >= buffer.duration - 0.5 ? 0 : trackOffsetRef.current
      );
    }
  };

  const handleToggleMetronome = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isMetronomePlaying) {
      engine.stop();
      setIsMetronomePlaying(false);
    } else {
      if (isTrackPlaying && audioBufferRef.current) {
        const anchor = trackStartTimeRef.current + firstBeatOffsetRef.current;
        engine.start(anchor);
      } else {
        engine.start();
      }
      setIsMetronomePlaying(true);
    }
  };

  const handleChangeBpm = (next: number) => {
    const clamped = Math.min(260, Math.max(30, Math.round(next)));
    setBpm(clamped);
    engineRef.current?.setBpm(clamped);
    if (!activeSong) {
      setBpmSourceLabel(t.metronome.manualTempo);
    }
  };

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current.filter((item) => now - item < 2500);
    taps.push(now);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      let sum = 0;
      for (let i = 1; i < taps.length; i++) {
        sum += taps[i] - taps[i - 1];
      }
      const avgMs = sum / (taps.length - 1);
      handleChangeBpm(Math.round(60000 / avgMs));
      setBpmSourceLabel(t.metronome.tapTempoSource);
    }
  };

  const handleChangeTimeSignature = (ts: string) => {
    setTimeSignature(ts);
    engineRef.current?.setTimeSignature(ts);
  };

  const handleChangeSubdivision = (sub: Subdivision) => {
    setSubdivision(sub);
    engineRef.current?.setSubdivision(sub);
  };

  const handleChangeClickSound = (snd: ClickSound) => {
    setClickSound(snd);
    engineRef.current?.setSound(snd);
  };

  const handleToggleAccent = () => {
    const next = !accentBeatOne;
    setAccentBeatOne(next);
    engineRef.current?.setAccentBeatOne(next);
  };

  const handleNudgePhase = (deltaMs: number) => {
    engineRef.current?.nudgePhase(deltaMs);
  };

  const handleRealignPhase = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isTrackPlaying && audioBufferRef.current) {
      engine.alignToAnchor(trackStartTimeRef.current + firstBeatOffsetRef.current);
    } else {
      engine.stop();
      engine.start();
      setIsMetronomePlaying(true);
    }
  };

  const handleChangeMetronomeVolume = (vol: number) => {
    setMetronomeVolume(vol);
    engineRef.current?.setVolume(vol);
  };

  const handleChangeTrackVolume = (vol: number) => {
    setTrackVolume(vol);
    effectsChainRef.current?.setMasterVolume(vol);
  };

  const handleExecuteSearch = async (overrideFilters?: SearchFilters) => {
    const f = overrideFilters || filters;
    const hasCriteria = Boolean(
      f.q.trim() ||
        f.artist.trim() ||
        f.album.trim() ||
        (f.genre && f.genre !== 'Tutti') ||
        f.year.trim()
    );

    if (!hasCriteria) {
      setHasActiveSearch(false);
      return;
    }

    setIsSearching(true);
    setHasActiveSearch(true);
    try {
      const params = new URLSearchParams();
      if (f.q.trim()) params.set('q', f.q.trim());
      if (f.artist.trim()) params.set('artist', f.artist.trim());
      if (f.album.trim()) params.set('album', f.album.trim());
      if (f.genre && f.genre !== 'Tutti') params.set('genre', f.genre);
      if (f.year.trim()) params.set('year', f.year.trim());

      const res = await fetch(`/api/music/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search error');
      const data = await res.json();
      setSearchSongs(Array.isArray(data.songs) ? data.songs : []);
      setSearchAlbums(Array.isArray(data.albums) ? data.albums : []);
    } catch {
      setSearchSongs([]);
      setSearchAlbums([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setFilters(DEFAULT_FILTERS);
    setHasActiveSearch(false);
    setSearchSongs([]);
    setSearchAlbums([]);
  };

  const handleOpenAlbum = async (album: AlbumItem) => {
    setIsLoadingAlbum(true);
    try {
      const res = await fetch(
        `/api/music/album/${encodeURIComponent(album.id)}?source=${album.source}`
      );
      if (!res.ok) throw new Error('Album not found');
      const data = await res.json();
      setSelectedAlbumDetail(data);
    } catch {
      setSelectedAlbumDetail(null);
    } finally {
      setIsLoadingAlbum(false);
    }
  };

  const handleDiscoverWebReleases = async () => {
    setIsDiscoveringWeb(true);
    setWebDiscoveryError(null);
    try {
      const res = await fetch('/api/music/discover-latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus: country === 'it' ? 'Italia e Internazionale' : 'Global Top New Releases',
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Discovery error');
      setWebDiscovery(data);
    } catch (err) {
      setWebDiscoveryError(err instanceof Error ? err.message : 'Discovery failed');
    } finally {
      setIsDiscoveringWeb(false);
    }
  };

  const handleCreatePlaylist = (name: string, description: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPlaylists((prev) => [newPl, ...prev]);
  };

  const handleUpdatePlaylist = (id: string, name: string, description: string) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name, description, updatedAt: Date.now() } : p))
    );
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddSongToPlaylist = (playlistId: string, song: SongItem) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        if (p.tracks.some((tr) => tr.id === song.id)) return p;
        return {
          ...p,
          tracks: [...p.tracks, song],
          updatedAt: Date.now(),
        };
      })
    );
  };

  const handleQuickCreatePlaylistAndAdd = (name: string, song: SongItem) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description: t.playlists.createdFromCatalogDesc,
      tracks: [song],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPlaylists((prev) => [newPl, ...prev]);
  };

  const handleRemoveSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? {
              ...p,
              tracks: p.tracks.filter((tr) => tr.id !== songId),
              updatedAt: Date.now(),
            }
          : p
      )
    );
  };

  const handleApplyCoverToSong = (imageUrl: string) => {
    if (!activeSong) return;
    setActiveSong((prev) => (prev ? { ...prev, artworkUrl: imageUrl } : prev));
  };

  const displayedSongs = hasActiveSearch ? searchSongs : feedSongs;
  const displayedAlbums = hasActiveSearch ? searchAlbums : feedAlbums;

  // Strictly 5 concise single-line links in Top Bar Contract
  const navItems: { id: AppTab; label: string }[] = [
    { id: 'releases', label: t.nav.releases },
    { id: 'catalog', label: t.nav.catalog },
    { id: 'playlists', label: t.nav.playlists },
    { id: 'history', label: t.nav.history },
    { id: 'studio', label: t.nav.studio },
  ];

  const activeAccentHex = visualSettings.customAccentHex || artworkPalette.primary || '#C6F100';
  const showLiquidBackdrop =
    visualSettings.theme === 'liquid-glass' || visualSettings.theme === 'dynamic-cover';

  return (
    <div className="min-h-screen flex flex-col relative bg-[#F4F4F0] dark:bg-[#0E100C] text-[#20251E] dark:text-[#EEF1E6] transition-colors">
      {showLiquidBackdrop ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -top-28 -left-24 w-[38rem] h-[38rem] rounded-full opacity-25 dark:opacity-20 blur-3xl transition-colors duration-700"
            style={{
              background: `radial-gradient(circle, ${activeAccentHex} 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute bottom-[-8rem] right-[-6rem] w-[36rem] h-[36rem] rounded-full opacity-20 blur-3xl transition-colors duration-700"
            style={{
              background: `radial-gradient(circle, ${
                visualSettings.theme === 'dynamic-cover'
                  ? artworkPalette.glow
                  : artworkPalette.secondary
              } 0%, transparent 70%)`,
            }}
          />
        </div>
      ) : null}

      {/* Top Bar Contract inside LastWave Floating Liquid Glass Pill Header */}
      <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pointer-events-none">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-14 rounded-full lw-liquid-bar flex items-center justify-between gap-8 pointer-events-auto">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('releases');
            }}
            className="font-display text-xl font-bold tracking-tight text-[#20251E] dark:text-[#EEF1E6] whitespace-nowrap shrink-0"
          >
            ritmostudio<span className="text-[#88A600] dark:text-[#C6F100]">.</span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-xs font-semibold"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                      : 'text-[#343B30] dark:text-[#E2E7DC] hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            {!pwaInstall.isInstalled ? (
              <a
                href="/scarica"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-[#262C24] dark:bg-[#C6F100] hover:opacity-90 text-[#F7F9F2] dark:text-[#20251E] text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.pwa.downloadChromeBtn}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('studio');
                  setSettingsSection('audio');
                }}
                className="px-4 py-2 rounded-full bg-[#262C24] dark:bg-[#C6F100] hover:opacity-90 text-[#F7F9F2] dark:text-[#20251E] text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t.nav.studio}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="md:hidden mt-2 max-w-[1240px] mx-auto rounded-full lw-liquid-bar px-2 py-1 flex items-center gap-1 overflow-x-auto pointer-events-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] font-semibold'
                    : 'text-[#5B5E57] dark:text-[#B8BFAE]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Clean Full-Width Spotify / LastWave Workspace */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 pt-5 pb-32">
        {downloadFeedback ? (
          <div className="mb-4 px-4 py-2 rounded-full bg-[#C6F100]/20 border border-[#536716]/30 text-xs font-semibold text-[#20251E] dark:text-[#C6F100] inline-flex items-center gap-2">
            <span>{downloadFeedback}</span>
          </div>
        ) : null}

        {(activeTab === 'releases' || activeTab === 'catalog') && (
          <CatalogView
            t={t.catalog}
            downloadT={t.download}
            mode={activeTab}
            songs={displayedSongs}
            albums={displayedAlbums}
            isLoadingFeed={isLoadingFeed}
            isSearching={isSearching}
            hasActiveSearch={hasActiveSearch}
            filters={filters}
            activeSongId={activeSong?.id}
            downloadingSongId={downloadingSongId}
            playlists={playlists}
            selectedAlbumDetail={selectedAlbumDetail}
            isLoadingAlbum={isLoadingAlbum}
            webDiscovery={webDiscovery}
            isDiscoveringWeb={isDiscoveringWeb}
            webDiscoveryError={webDiscoveryError}
            onChangeFilters={setFilters}
            onExecuteSearch={handleExecuteSearch}
            onClearSearch={handleClearSearch}
            onSelectSong={(song) => void handleSelectSong(song)}
            onDownloadAtmos={(song) => void handleDownloadAtmos(song)}
            onOpenAlbum={(alb) => void handleOpenAlbum(alb)}
            onCloseAlbum={() => setSelectedAlbumDetail(null)}
            onAddSongToPlaylist={handleAddSongToPlaylist}
            onShareSong={(song) => setShareTarget({ type: 'song', song })}
            onDiscoverWebReleases={() => void handleDiscoverWebReleases()}
            onQuickCreatePlaylistAndAdd={handleQuickCreatePlaylistAndAdd}
          />
        )}

        {activeTab === 'playlists' && (
          <PlaylistView
            t={t.playlists}
            locale={locale}
            playlists={playlists}
            activeSongId={activeSong?.id}
            onCreatePlaylist={handleCreatePlaylist}
            onUpdatePlaylist={handleUpdatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
            onSelectSong={(song) => void handleSelectSong(song)}
            onSharePlaylist={(playlist) => setShareTarget({ type: 'playlist', playlist })}
            onShareSong={(song) => setShareTarget({ type: 'song', song })}
          />
        )}

        {activeTab === 'history' && (
          <HistoryStatsView
            t={t.history}
            downloadT={t.download}
            syncLabel={t.catalog.syncBtn}
            syncedLabel={t.catalog.syncedBtn}
            locale={locale}
            entries={historyEntries}
            activeSongId={activeSong?.id}
            downloadingSongId={downloadingSongId}
            onSelectSong={(song) => void handleSelectSong(song)}
            onDownloadAtmos={(song) => void handleDownloadAtmos(song)}
            onClearHistory={() => setHistoryEntries([])}
          />
        )}

        {activeTab === 'studio' && (
          <LiquidStudioView
            t={t.liquid}
            navT={t.nav}
            toolbarT={t.toolbar}
            effectsChain={effectsChainRef.current!}
            audioFx={audioFx}
            visualSettings={visualSettings}
            palette={artworkPalette}
            activeSong={activeSong}
            bpm={bpm}
            timeSignature={timeSignature}
            isTrackPlaying={isTrackPlaying}
            isMetronomePlaying={isMetronomePlaying}
            currentBeatIndex={currentBeatIndex}
            autoSyncEnabled={autoSyncEnabled}
            castStatus={googleCast.castStatus}
            castDeviceName={googleCast.deviceName}
            isCastingSong={googleCast.isCastingSong}
            lastCastSongTitle={googleCast.lastCastSongTitle}
            castErrorCode={googleCast.castErrorCode}
            isInIframe={googleCast.isInIframe}
            language={language}
            country={country}
            sleepTimerMinutes={sleepTimerMinutes}
            sleepRemainingSec={sleepRemainingSec}
            historyCount={historyEntries.length}
            playlistsCount={playlists.length}
            initialSection={settingsSection}
            coversSlot={
              <CoverStudioView
                t={t.covers}
                activeSong={activeSong}
                covers={covers}
                onCoverGenerated={(cov) => setCovers((prev) => [cov, ...prev])}
                onApplyCoverToSong={handleApplyCoverToSong}
              />
            }
            chatSlot={
              <MusicChatView
                t={t.chat}
                language={language}
                locale={locale}
                activeSong={activeSong}
                bpm={bpm}
                timeSignature={timeSignature}
                messages={chatMessages}
                onMessagesChange={setChatMessages}
              />
            }
            onChangeAudioFx={setAudioFx}
            onChangeVisualSettings={setVisualSettings}
            onToggleTrackPlay={handleToggleTrackPlay}
            onToggleAutoSync={() => setAutoSyncEnabled((v) => !v)}
            onRequestCast={() => void googleCast.requestCastSession()}
            onStopCast={googleCast.stopCastSession}
            onCastActiveSong={() => {
              if (activeSong) void googleCast.castSong(activeSong);
            }}
            onChangeLanguage={setLanguage}
            onChangeCountry={(c) => {
              setCountry(c);
              setHasActiveSearch(false);
            }}
            onSetSleepTimer={handleSetSleepTimer}
            onOpenLyrics={() => setLyricsDrawerOpen(true)}
            onClearHistory={() => setHistoryEntries([])}
            onExportLibraryJson={() => {
              const payload = {
                exportedAt: new Date().toISOString(),
                playlists,
                history: historyEntries,
              };
              const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'ritmostudio-library.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.setTimeout(() => URL.revokeObjectURL(url), 3000);
            }}
          />
        )}

        {/* Clean LastWave Editorial Footer (Preferences & APK Download without cluttering the main screen) */}
        <footer className="mt-12 pt-6 border-t border-[#D6D6CF] dark:border-[#2C3027] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5B5E57] dark:text-[#B8BFAE]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-bold text-sm text-[#20251E] dark:text-[#EEF1E6]">
              ritmostudio<span className="text-[#88A600] dark:text-[#C6F100]">.</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {lastUpdatedIso
                ? `${t.toolbar.updatedAt} ${new Date(lastUpdatedIso).toLocaleTimeString(locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} · ${secondsToNextSync}s`
                : t.toolbar.loadingCatalog}
            </span>
            <button
              type="button"
              onClick={() => void fetchFeed(country)}
              disabled={isLoadingFeed}
              className="inline-flex items-center gap-1 hover:text-[#20251E] dark:hover:text-[#EEF1E6] cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingFeed ? 'animate-spin' : ''}`} />
              <span>{t.nav.refreshReleases}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-[#FBFBFA] dark:bg-[#161912] border border-[#D6D6CF] dark:border-[#2C3027]">
              <button
                type="button"
                onClick={() => {
                  setCountry('it');
                  setHasActiveSearch(false);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                  country === 'it'
                    ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] font-semibold'
                    : 'text-[#5B5E57] dark:text-[#B8BFAE]'
                }`}
              >
                {t.toolbar.regionItaly}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCountry('us');
                  setHasActiveSearch(false);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                  country === 'us'
                    ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] font-semibold'
                    : 'text-[#5B5E57] dark:text-[#B8BFAE]'
                }`}
              >
                {t.toolbar.regionGlobal}
              </button>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              aria-label={t.toolbar.languageLabel}
              className="rounded-full border border-[#D6D6CF] dark:border-[#2C3027] bg-[#FBFBFA] dark:bg-[#161912] px-3 py-1 text-[11px] font-medium text-[#20251E] dark:text-[#EEF1E6] cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>

            {!pwaInstall.isInstalled ? (
              <a
                href="/scarica"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] bg-[#FBFBFA] dark:bg-[#161912] hover:border-[#536716] dark:hover:border-[#C6F100] text-[11px] font-semibold text-[#20251E] dark:text-[#EEF1E6] inline-flex items-center gap-1.5"
              >
                <Download className="w-3 h-3 text-[#536716] dark:text-[#C6F100]" />
                <span>{t.pwa.downloadChromeBtn}</span>
              </a>
            ) : null}
          </div>
        </footer>
      </main>

      {/* Spotify / LastWave Sticky Now Playing Player Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 px-3 sm:px-6 pb-3 pointer-events-none">
        <div className="max-w-[1240px] mx-auto rounded-2xl sm:rounded-full bg-[#0E100C]/95 backdrop-blur-xl text-[#EEF1E6] border border-[#2C3027] px-3.5 sm:px-5 py-2.5 shadow-2xl flex items-center justify-between gap-3 pointer-events-auto">
          {/* Left: Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-[320px]">
            {activeSong ? (
              <>
                <ArtworkImage
                  src={activeSong.artworkUrl}
                  alt={activeSong.title}
                  fallbackLabel={activeSong.title}
                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#2C3027]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-[#EEF1E6] truncate">
                    {activeSong.title}
                  </p>
                  <p className="text-[11px] text-[#B8BFAE] truncate">
                    {activeSong.artist}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#161912] border border-[#2C3027] flex items-center justify-center shrink-0">
                  <AudioWaveform className="w-4 h-4 text-[#C6F100]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#EEF1E6] truncate">
                    {t.metronome.freeMetronome}
                  </p>
                  <p className="text-[11px] font-mono tabular-nums text-[#B8BFAE] truncate">
                    {bpm} BPM · {timeSignature}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Center: Spotify-style Play/Pause & Live Progress */}
          <div className="flex items-center gap-3 sm:flex-1 sm:max-w-md justify-center">
            {activeSong?.previewUrl ? (
              <button
                type="button"
                onClick={handleToggleTrackPlay}
                aria-label={isTrackPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 rounded-full bg-[#C6F100] text-[#20251E] hover:brightness-95 flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
              >
                {isTrackPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            ) : null}

            <div className="hidden sm:flex items-center gap-2.5 flex-1">
              <span className="text-[10px] font-mono tabular-nums text-[#B8BFAE] w-8 text-right">
                {`${Math.floor((trackProgress * trackDurationSec) / 60)}:${Math.round((trackProgress * trackDurationSec) % 60)
                  .toString()
                  .padStart(2, '0')}`}
              </span>
              <div className="flex-1 h-1.5 bg-[#2C3027] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C6F100] rounded-full transition-[width] duration-100"
                  style={{ width: `${Math.min(100, Math.max(0, trackProgress * 100))}%` }}
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums text-[#B8BFAE] w-8">
                {`${Math.floor(trackDurationSec / 60)}:${Math.round(trackDurationSec % 60)
                  .toString()
                  .padStart(2, '0')}`}
              </span>
            </div>
          </div>

          {/* Right: ONLY Metronome & Metronome Sync Section in Dynamic Bar */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleMetronome}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isMetronomePlaying
                  ? 'bg-[#C6F100] text-[#20251E]'
                  : 'bg-[#161912] border border-[#2C3027] text-[#EEF1E6] hover:border-[#C6F100]'
              }`}
            >
              {isMetronomePlaying ? (
                <Square className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              <span className="font-mono tabular-nums">{bpm} BPM</span>
            </button>

            <button
              type="button"
              onClick={() => setAutoSyncEnabled((v) => !v)}
              className={`hidden sm:inline-flex px-3 py-1.5 rounded-full text-[11px] font-semibold items-center gap-1 cursor-pointer transition-colors ${
                autoSyncEnabled
                  ? 'bg-[#C6F100]/20 border border-[#C6F100]/50 text-[#C6F100]'
                  : 'bg-[#161912] border border-[#2C3027] text-[#B8BFAE] hover:border-[#C6F100]'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>{autoSyncEnabled ? t.metronome.autoSyncOn : t.metronome.autoSyncOff}</span>
            </button>

            <button
              type="button"
              onClick={handleRealignPhase}
              title={t.metronome.alignBtn}
              aria-label={t.metronome.alignBtn}
              className="hidden md:inline-flex px-2.5 py-1.5 rounded-full bg-[#161912] border border-[#2C3027] hover:border-[#C6F100] text-[11px] font-semibold text-[#EEF1E6] cursor-pointer"
            >
              {t.metronome.alignBtn}
            </button>

            <button
              type="button"
              onClick={() => setMobileMetronomeOpen(true)}
              aria-label={t.metronome.title}
              className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-[#EEF1E6] cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Over Metronome Hardware Rack (Desktop & Mobile) */}
      {mobileMetronomeOpen ? (
        <div className="fixed inset-0 z-50 bg-[#0E100C]/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-[22px] relative shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileMetronomeOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#EEF1E6] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <MetronomeHardware
              t={t.metronome}
              activeSong={activeSong}
              bpm={bpm}
              timeSignature={timeSignature}
              subdivision={subdivision}
              clickSound={clickSound}
              accentBeatOne={accentBeatOne}
              isMetronomePlaying={isMetronomePlaying}
              currentBeatIndex={currentBeatIndex}
              isTrackPlaying={isTrackPlaying}
              isAnalyzingAudio={isAnalyzingAudio}
              autoSyncEnabled={autoSyncEnabled}
              metronomeVolume={metronomeVolume}
              trackVolume={trackVolume}
              trackProgress={trackProgress}
              trackDurationSec={trackDurationSec}
              bpmSourceLabel={bpmSourceLabel}
              onToggleMetronome={handleToggleMetronome}
              onChangeBpm={handleChangeBpm}
              onTapTempo={handleTapTempo}
              onChangeTimeSignature={handleChangeTimeSignature}
              onChangeSubdivision={handleChangeSubdivision}
              onChangeClickSound={handleChangeClickSound}
              onToggleAccent={handleToggleAccent}
              onToggleTrackPlay={handleToggleTrackPlay}
              onToggleAutoSync={() => setAutoSyncEnabled((v) => !v)}
              onNudgePhase={handleNudgePhase}
              onRealignPhase={handleRealignPhase}
              onChangeMetronomeVolume={handleChangeMetronomeVolume}
              onChangeTrackVolume={handleChangeTrackVolume}
              onOpenCoverFromSong={() => {
                setMobileMetronomeOpen(false);
                setActiveTab('studio');
                setSettingsSection('covers');
              }}
            />
          </div>
        </div>
      ) : null}

      <LyricsDrawer
        open={lyricsDrawerOpen}
        song={activeSong}
        currentTimeSec={trackProgress * trackDurationSec}
        visualSettings={visualSettings}
        onChangeVisualSettings={setVisualSettings}
        onClose={() => setLyricsDrawerOpen(false)}
      />
      <ShareModal target={shareTarget} t={t.share} onClose={() => setShareTarget(null)} />
      <OfflineIndicator label={t.pwa.offlineBanner} />
    </div>
  );
}
