export type AppLanguage = 'it' | 'en' | 'es' | 'fr' | 'de';

export type Subdivision = 1 | 2 | 3 | 4;

export type ClickSound = 'wood' | 'digital' | 'rimshot';

export type ImageSizeOption = '1K' | '2K' | '4K';

export type AspectRatioOption = '1:1' | '16:9' | '3:4' | '9:16' | '4:3';

export type ChatModelId =
  | 'gemini-4-carbon'
  | 'gemini-4-argon'
  | 'gemini-4-hydrogen'
  | 'gemini-3.1-flash-lite';

export interface SongItem {
  id: string;
  source: 'itunes' | 'deezer';
  title: string;
  artist: string;
  album: string;
  albumId?: string;
  artworkUrl: string;
  previewUrl?: string;
  releaseDate: string;
  genre: string;
  durationMs: number;
  bpm?: number;
  timeSignature?: string;
  musicalKey?: string;
  bpmSource?: 'deezer' | 'audio-dsp' | 'gemini' | 'manual' | 'estimated';
  externalUrl?: string;
}

export interface AlbumItem {
  id: string;
  source: 'itunes' | 'deezer';
  title: string;
  artist: string;
  artworkUrl: string;
  releaseDate: string;
  genre: string;
  trackCount?: number;
  externalUrl?: string;
}

export interface AlbumDetail extends AlbumItem {
  tracks: SongItem[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: SongItem[];
  createdAt: number;
  updatedAt: number;
}

export interface ListeningEntry {
  id: string;
  song: SongItem;
  playedAt: number;
  playCount: number;
  bpmSynced: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  model?: ChatModelId;
  timestamp: number;
  sources?: GroundingSource[];
  error?: boolean;
}

export interface GeneratedCover {
  id: string;
  imageUrl: string;
  prompt: string;
  size: ImageSizeOption;
  aspectRatio: AspectRatioOption;
  songTitle?: string;
  artist?: string;
  createdAt: number;
}

export type AudioPresetId =
  | 'flat'
  | 'atmos'
  | 'liquid-warmth'
  | 'club-bass'
  | 'vocal'
  | 'night';

export type AudioQualityId =
  | 'atmos-mp3'
  | 'cd-lossless'
  | 'hires-96'
  | 'master-192';

export type AutoEqProfileId =
  | 'none'
  | 'harman-2019'
  | 'airpods-pro-2'
  | 'sony-xm5'
  | 'hd650'
  | 'dt770'
  | 'm50x'
  | 'earpods';

export type TargetLufs = -14 | -16 | -18;

export type RepeatMode = 'off' | 'all' | 'one';

export interface AudioFxSettings {
  preset: AudioPresetId;
  quality: AudioQualityId;
  bitPerfectMode: boolean;
  uac2ClockBypass: boolean;
  normalizationEnabled: boolean;
  targetLufs: TargetLufs;
  skipSilenceEnabled: boolean;
  autoEqProfile: AutoEqProfileId;
  eq15Bands: number[];
  automixEnabled: boolean;
  crossfadeSec: number;
  bassDb: number;
  midDb: number;
  trebleDb: number;
  spatialWidth: number;
  reverbMix: number;
  playbackRate: number;
}

export type ScreenThemeId =
  | 'studio-light'
  | 'obsidian-dark'
  | 'amoled-black'
  | 'liquid-glass'
  | 'dynamic-cover';

export type VisualizerStyleId =
  | 'liquid-waves'
  | 'orbital-glass'
  | 'spectrum-silk'
  | 'cover-aura';

export interface VisualSettings {
  theme: ScreenThemeId;
  visualizer: VisualizerStyleId;
  glassBlurPx: number;
  motionIntensity: number;
  customAccentHex: string;
  showAlbumInStage: boolean;
  spotifyCanvasEnabled: boolean;
  originIslandEnabled: boolean;
  hapticBeatEnabled: boolean;
  lyricsFontSize: 'sm' | 'md' | 'lg';
  lyricsCenterAlign: boolean;
  lyricsAutoScroll: boolean;
  lastfmScrobbleEnabled: boolean;
  lastfmUsername: string;
}

export interface ArtworkPalette {
  primary: string;
  secondary: string;
  glow: string;
}

export interface LyricsPayload {
  id?: number;
  trackName: string;
  artistName: string;
  syncedLyrics: string | null;
  plainLyrics: string | null;
  instrumental: boolean;
  provider: string;
}

export interface SoundGemPreset {
  id: string;
  name: string;
  subtitle: string;
  spec: string;
  accentHex: string;
  visualizer: VisualizerStyleId;
  audioPatch: Partial<AudioFxSettings>;
}

export interface AiMusicGem {
  id: string;
  name: string;
  role: string;
  description: string;
  model: ChatModelId;
  starterPrompt: string;
}

export interface JamRoomState {
  code: string;
  hostName: string;
  song: SongItem | null;
  isPlaying: boolean;
  positionSec: number;
  bpm: number;
  queue: SongItem[];
  listenerCount: number;
  updatedAt: number;
}

