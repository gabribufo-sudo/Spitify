import { useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Play,
  AudioWaveform,
  Plus,
  Share2,
  Disc3,
  Globe,
  Loader2,
  X,
  ExternalLink,
  Check,
  ChevronRight,
  Download,
} from 'lucide-react';
import type {
  AlbumDetail,
  AlbumItem,
  GroundingSource,
  Playlist,
  SongItem,
} from '../types/music';
import type { Translations } from '../i18n/translations';
import { ArtworkImage } from './ArtworkImage';

export interface SearchFilters {
  q: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
}

interface CatalogViewProps {
  t: Translations['catalog'];
  downloadT: Translations['download'];
  mode: 'releases' | 'catalog';
  songs: SongItem[];
  albums: AlbumItem[];
  isLoadingFeed: boolean;
  isSearching: boolean;
  hasActiveSearch: boolean;
  filters: SearchFilters;
  activeSongId?: string;
  downloadingSongId: string | null;
  playlists: Playlist[];
  selectedAlbumDetail: AlbumDetail | null;
  isLoadingAlbum: boolean;
  webDiscovery: {
    summary: string;
    sources: GroundingSource[];
    discoveredAt: string;
  } | null;
  isDiscoveringWeb: boolean;
  webDiscoveryError: string | null;
  onChangeFilters: (next: SearchFilters) => void;
  onExecuteSearch: (nextFilters?: SearchFilters) => void;
  onClearSearch: () => void;
  onSelectSong: (song: SongItem) => void;
  onDownloadAtmos: (song: SongItem) => void;
  onOpenAlbum: (album: AlbumItem) => void;
  onCloseAlbum: () => void;
  onAddSongToPlaylist: (playlistId: string, song: SongItem) => void;
  onShareSong: (song: SongItem) => void;
  onDiscoverWebReleases: () => void;
  onQuickCreatePlaylistAndAdd: (name: string, song: SongItem) => void;
}

const GENRE_OPTIONS = [
  'Tutti',
  'Pop',
  'Hip-Hop/Rap',
  'Rock',
  'Alternativa',
  'Elettronica',
  'Dance',
  'Indie',
  'Jazz',
  'R&B/Soul',
  'Classica',
  'Latino',
];

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function matchesClientYear(releaseDate: string, yearFilter: string): boolean {
  if (!yearFilter) return true;
  const match = String(releaseDate || '').match(/\d{4}/);
  if (!match) return false;
  const y = Number(match[0]);
  const trimmed = yearFilter.trim();
  if (/^\d{4}$/.test(trimmed)) return y === Number(trimmed);
  if (/^<\d{4}$/.test(trimmed)) return y < Number(trimmed.slice(1));
  const range = trimmed.match(/^(\d{4})-(\d{4})$/);
  if (range) return y >= Number(range[1]) && y <= Number(range[2]);
  return String(releaseDate).includes(trimmed);
}

const GENRE_ALIASES: Record<string, string[]> = {
  alternativa: ['alternativa', 'alternative', 'indie'],
  alternative: ['alternativa', 'alternative', 'indie'],
  indie: ['indie', 'alternativa', 'alternative'],
  elettronica: ['elettronica', 'electronic', 'musica elettronica', 'dance'],
  electronic: ['elettronica', 'electronic', 'musica elettronica', 'dance'],
  classica: ['classica', 'classical'],
  latino: ['latino', 'latina', 'musica latina', 'latin'],
  'hip-hop/rap': ['hip-hop', 'hip hop', 'rap', 'trap'],
  'r&b/soul': ['r&b', 'soul'],
  rock: ['rock', 'alternativa', 'alternative'],
};

function matchesClientGenre(itemGenre: string, selectedGenre: string): boolean {
  if (!selectedGenre || selectedGenre === 'Tutti') return true;
  const gLower = String(itemGenre || '').toLowerCase();
  const selLower = selectedGenre.toLowerCase();
  const aliases = GENRE_ALIASES[selLower] || [selLower];
  return aliases.some((alias) => gLower.includes(alias));
}

export function CatalogView({
  t,
  downloadT,
  mode,
  songs,
  albums,
  isLoadingFeed,
  isSearching,
  hasActiveSearch,
  filters,
  activeSongId,
  downloadingSongId,
  playlists,
  selectedAlbumDetail,
  isLoadingAlbum,
  webDiscovery,
  isDiscoveringWeb,
  webDiscoveryError,
  onChangeFilters,
  onExecuteSearch,
  onClearSearch,
  onSelectSong,
  onDownloadAtmos,
  onOpenAlbum,
  onCloseAlbum,
  onAddSongToPlaylist,
  onShareSong,
  onDiscoverWebReleases,
  onQuickCreatePlaylistAndAdd,
}: CatalogViewProps) {
  const [showAdvanced, setShowAdvanced] = useState(mode === 'catalog');
  const [playlistMenuSongId, setPlaylistMenuSongId] = useState<string | null>(null);
  const [addedFeedbackKey, setAddedFeedbackKey] = useState<string | null>(null);
  const [quickPlName, setQuickPlName] = useState('');

  const yearPresets = [
    { value: '', label: t.allYears },
    { value: '2026', label: t.latestYear },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2020-2023', label: '2020 – 2023' },
    { value: '<2020', label: t.before2020 },
  ];

  const filteredSongs = useMemo(() => {
    return songs.filter((s) => {
      if (filters.artist && !s.artist.toLowerCase().includes(filters.artist.trim().toLowerCase())) {
        return false;
      }
      if (filters.album && !s.album.toLowerCase().includes(filters.album.trim().toLowerCase())) {
        return false;
      }
      if (filters.genre && filters.genre !== 'Tutti' && !matchesClientGenre(s.genre, filters.genre)) {
        return false;
      }
      if (filters.year && !matchesClientYear(s.releaseDate, filters.year)) {
        return false;
      }
      if (filters.q && !hasActiveSearch) {
        const q = filters.q.trim().toLowerCase();
        if (
          !s.title.toLowerCase().includes(q) &&
          !s.artist.toLowerCase().includes(q) &&
          !s.album.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [songs, filters, hasActiveSearch]);

  const filteredAlbums = useMemo(() => {
    return albums.filter((a) => {
      if (filters.artist && !a.artist.toLowerCase().includes(filters.artist.trim().toLowerCase())) {
        return false;
      }
      if (filters.album && !a.title.toLowerCase().includes(filters.album.trim().toLowerCase())) {
        return false;
      }
      if (filters.genre && filters.genre !== 'Tutti' && !matchesClientGenre(a.genre, filters.genre)) {
        return false;
      }
      if (filters.year && !matchesClientYear(a.releaseDate, filters.year)) {
        return false;
      }
      if (filters.q && !hasActiveSearch) {
        const q = filters.q.trim().toLowerCase();
        if (!a.title.toLowerCase().includes(q) && !a.artist.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [albums, filters, hasActiveSearch]);

  const featuredSong = filteredSongs[0] || songs[0] || null;
  const activeFilterCount = [
    filters.artist,
    filters.album,
    filters.genre !== 'Tutti' ? filters.genre : '',
    filters.year,
  ].filter(Boolean).length;

  const handleAddClick = (playlistId: string, song: SongItem) => {
    onAddSongToPlaylist(playlistId, song);
    const key = `${playlistId}-${song.id}`;
    setAddedFeedbackKey(key);
    window.setTimeout(() => {
      setAddedFeedbackKey(null);
      setPlaylistMenuSongId(null);
    }, 900);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* LastWave / Spotify Hero Banner (Releases mode only) */}
      {mode === 'releases' && !hasActiveSearch ? (
        <section className="relative rounded-[24px] overflow-hidden border border-[#2C3027] bg-[#0E100C] min-h-[210px] flex items-end">
          {/* Concentric Orbital Rings matching lastwave.clashprojects.in */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full border border-[#EEF1E6]/10" />
            <div className="absolute -right-12 -top-12 w-[310px] h-[310px] rounded-full border border-[#C6F100]/15" />
            <div className="absolute right-4 top-4 w-[190px] h-[190px] rounded-full border border-[#EEF1E6]/10" />
            <div
              className="absolute right-8 -top-8 w-64 h-64 rounded-full blur-3xl opacity-25"
              style={{ background: 'radial-gradient(circle, #C6F100 0%, transparent 70%)' }}
            />
          </div>

          <img
            src="/src/assets/images/studio_vinyl_mastering_1794605674517.jpg"
            alt="RitmoStudio console"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E100C] via-[#0E100C]/90 to-[#0E100C]/45" />

          <div className="relative z-10 p-6 sm:p-7 flex flex-col md:flex-row md:items-end justify-between gap-5 w-full">
            <div className="max-w-xl">
              <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#C6F100] mb-2">
                ✳ LOSSLESS · 24-BIT / 192 KHZ
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#EEF1E6]">
                {t.heroTitle}
              </h1>
              <p className="text-sm text-[#B8BFAE] mt-2 leading-relaxed">{t.heroSubtitle}</p>
            </div>

            {featuredSong ? (
              <button
                type="button"
                onClick={() => onSelectSong(featuredSong)}
                className="px-5 py-3 rounded-full bg-[#C6F100] hover:brightness-95 text-[#20251E] text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-[#C6F100]/15"
              >
                <Play className="w-4 h-4 fill-current" />
                <span className="truncate max-w-[220px]">
                  {t.syncTopSong}: {featuredSong.title}
                </span>
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Clean Spotify / LastWave Search Pill Bar */}
      <section className="lw-glass-card rounded-[22px] p-3.5 sm:p-4 flex flex-col gap-3.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onExecuteSearch();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5B5E57] dark:text-[#B8BFAE] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => onChangeFilters({ ...filters, q: e.target.value })}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-full border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] pl-11 pr-4 py-2.5 text-sm text-[#20251E] dark:text-[#EEF1E6] placeholder:text-[#5B5E57]/70 dark:placeholder:text-[#B8BFAE]/60 focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={`px-4 py-2.5 rounded-full border text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showAdvanced || activeFilterCount > 0
                ? 'bg-[#20251E] dark:bg-[#C6F100] border-[#20251E] dark:border-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                : 'bg-[#FBFBFA] dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#20251E] dark:text-[#EEF1E6] hover:border-[#536716] dark:hover:border-[#C6F100]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {t.advancedSearch}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </span>
          </button>

          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-full bg-[#C6F100] hover:brightness-95 disabled:opacity-50 text-[#20251E] text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t.searchingBtn}</span>
              </>
            ) : (
              <span>{t.searchBtn}</span>
            )}
          </button>
        </form>

        {showAdvanced ? (
          <div className="pt-3.5 border-t border-[#D6D6CF]/70 dark:border-[#2C3027] flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[#5B5E57] dark:text-[#B8BFAE]">
                  {t.artistLabel}
                </span>
                <input
                  type="text"
                  value={filters.artist}
                  onChange={(e) => onChangeFilters({ ...filters, artist: e.target.value })}
                  placeholder={t.artistPlaceholder}
                  className="rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-3 py-1.5 text-sm text-[#20251E] dark:text-[#EEF1E6] focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[#5B5E57] dark:text-[#B8BFAE]">
                  {t.albumLabel}
                </span>
                <input
                  type="text"
                  value={filters.album}
                  onChange={(e) => onChangeFilters({ ...filters, album: e.target.value })}
                  placeholder={t.albumPlaceholder}
                  className="rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-3 py-1.5 text-sm text-[#20251E] dark:text-[#EEF1E6] focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[#5B5E57] dark:text-[#B8BFAE]">
                  {t.genreLabel}
                </span>
                <select
                  value={filters.genre}
                  onChange={(e) => onChangeFilters({ ...filters, genre: e.target.value })}
                  className="rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-3 py-1.5 text-sm text-[#20251E] dark:text-[#EEF1E6] focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
                >
                  {GENRE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[#5B5E57] dark:text-[#B8BFAE]">
                  {t.yearLabel}
                </span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={yearPresets.some((p) => p.value === filters.year) ? filters.year : ''}
                    onChange={(e) => onChangeFilters({ ...filters, year: e.target.value })}
                    aria-label={t.yearLabel}
                    className="flex-1 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-2.5 py-1.5 text-sm text-[#20251E] dark:text-[#EEF1E6] focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
                  >
                    {yearPresets.map((y) => (
                      <option key={y.label} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    maxLength={9}
                    value={filters.year}
                    onChange={(e) => onChangeFilters({ ...filters, year: e.target.value })}
                    placeholder="YYYY"
                    aria-label={t.yearLabel}
                    className="w-18 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-2.5 py-1.5 text-sm font-mono tabular-nums text-[#20251E] dark:text-[#EEF1E6] focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE]">{t.filterHint}</p>
              <div className="flex items-center gap-2">
                {hasActiveSearch || activeFilterCount > 0 || filters.q ? (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="px-3.5 py-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] cursor-pointer"
                  >
                    {t.clearFilters}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onExecuteSearch()}
                  className="px-4 py-1.5 rounded-full bg-[#20251E] dark:bg-[#C6F100] hover:opacity-90 text-[#F4F4F0] dark:text-[#20251E] text-xs font-bold cursor-pointer"
                >
                  {t.applyCatalog}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Selected Album Tracklist Drawer */}
      {selectedAlbumDetail || isLoadingAlbum ? (
        <section className="lw-glass-card rounded-[22px] overflow-hidden border border-[#536716]/40 dark:border-[#C6F100]/35">
          {isLoadingAlbum ? (
            <div className="p-6 flex items-center justify-center gap-3 text-sm text-[#5B5E57] dark:text-[#B8BFAE]">
              <Loader2 className="w-4 h-4 animate-spin text-[#536716] dark:text-[#C6F100]" />
              <span>{t.loadingAlbumTracks}</span>
            </div>
          ) : selectedAlbumDetail ? (
            <div>
              <div className="p-4 sm:p-5 border-b border-[#D6D6CF]/70 dark:border-[#2C3027] flex items-start justify-between gap-4 bg-[#F4F4F0]/70 dark:bg-[#161912]">
                <div className="flex items-center gap-3.5">
                  <ArtworkImage
                    src={selectedAlbumDetail.artworkUrl}
                    alt={selectedAlbumDetail.title}
                    fallbackLabel={selectedAlbumDetail.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#D6D6CF] dark:border-[#2C3027]"
                  />
                  <div>
                    <h2 className="text-base font-bold text-[#20251E] dark:text-[#EEF1E6]">
                      {selectedAlbumDetail.title}
                    </h2>
                    <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5">
                      {selectedAlbumDetail.artist} · {selectedAlbumDetail.genre} ·{' '}
                      <span className="font-mono tabular-nums">
                        {selectedAlbumDetail.releaseDate.slice(0, 4)}
                      </span>{' '}
                      · {selectedAlbumDetail.tracks.length} {t.tracksCount}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onCloseAlbum}
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#5B5E57] dark:text-[#B8BFAE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-[#D6D6CF]/50 dark:divide-[#2C3027]">
                {selectedAlbumDetail.tracks.map((tr, i) => {
                  const isActive = activeSongId === tr.id;
                  const isDownloading = downloadingSongId === tr.id;
                  return (
                    <div
                      key={tr.id}
                      className={`px-4 sm:px-5 py-2.5 flex items-center gap-3 transition-colors ${
                        isActive
                          ? 'bg-[#C6F100]/15 dark:bg-[#C6F100]/10'
                          : 'hover:bg-[#F4F4F0]/80 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="w-5 text-xs font-mono tabular-nums text-[#5B5E57] dark:text-[#B8BFAE] text-right">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#20251E] dark:text-[#EEF1E6] truncate">
                          {tr.title}
                        </p>
                        <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] truncate">
                          {tr.artist}
                        </p>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-[#5B5E57] dark:text-[#B8BFAE]">
                        {formatDuration(tr.durationMs)}
                      </span>
                      <button
                        type="button"
                        disabled={!tr.previewUrl || isDownloading}
                        title={tr.previewUrl ? downloadT.atmosTitle : downloadT.atmosUnavailable}
                        onClick={() => onDownloadAtmos(tr)}
                        className="p-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] disabled:opacity-40 text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white cursor-pointer"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#536716] dark:text-[#C6F100]" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectSong(tr)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-[#C6F100] text-[#20251E]'
                            : 'bg-[#20251E] dark:bg-[#EEF1E6] hover:opacity-90 text-[#F4F4F0] dark:text-[#20251E]'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <AudioWaveform className="w-3.5 h-3.5" />
                            <span>{t.syncedBtn}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>{t.syncBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Albums Grid (Spotify / LastWave Shelf) + Inline Web Discovery */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#20251E] dark:text-[#EEF1E6]">
              {hasActiveSearch
                ? `${t.albumsFound} (${filteredAlbums.length})`
                : t.newAlbumsTitle}
            </h2>
            <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE]">{t.openAlbumHint}</p>
          </div>

          {mode === 'releases' && !hasActiveSearch ? (
            <button
              type="button"
              onClick={onDiscoverWebReleases}
              disabled={isDiscoveringWeb}
              className="px-3.5 py-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] bg-[#FBFBFA] dark:bg-[#161912] hover:border-[#536716] dark:hover:border-[#C6F100] text-xs font-semibold text-[#20251E] dark:text-[#EEF1E6] flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              {isDiscoveringWeb ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#536716] dark:text-[#C6F100]" />
                  <span>{t.webBulletinLoading}</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-[#536716] dark:text-[#C6F100]" />
                  <span>{t.webBulletinBtn}</span>
                </>
              )}
            </button>
          ) : null}
        </div>

        {webDiscoveryError ? (
          <p className="text-xs text-[#B91C1C] dark:text-[#FCA5A5] bg-[#DC2626]/5 dark:bg-[#DC2626]/15 border border-[#DC2626]/20 rounded-xl px-3.5 py-2.5">
            {webDiscoveryError}
          </p>
        ) : null}

        {webDiscovery ? (
          <div className="lw-glass-card rounded-[20px] p-4 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-[#20251E] dark:text-[#EEF1E6]">
              {t.webBulletinTitle}
            </h3>
            <div className="text-sm text-[#20251E] dark:text-[#EEF1E6]/90 leading-relaxed whitespace-pre-wrap">
              {webDiscovery.summary}
            </div>
            {webDiscovery.sources.length > 0 ? (
              <div className="flex flex-wrap gap-3 pt-1">
                {webDiscovery.sources.slice(0, 5).map((src, idx) => (
                  <a
                    key={`${src.uri}-${idx}`}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-[#C6F100] underline underline-offset-2 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[220px]">{src.title}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {isLoadingFeed && filteredAlbums.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="lw-glass-card rounded-2xl p-3 animate-pulse"
              >
                <div className="aspect-square bg-[#ECECE6] dark:bg-[#2C3027] rounded-xl mb-2.5" />
                <div className="h-3.5 bg-[#ECECE6] dark:bg-[#2C3027] rounded w-3/4 mb-1" />
                <div className="h-3 bg-[#ECECE6] dark:bg-[#2C3027] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="lw-glass-card rounded-[20px] p-6 text-center text-sm text-[#5B5E57] dark:text-[#B8BFAE]">
            {t.noAlbumsFound}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredAlbums.slice(0, 8).map((alb) => (
              <button
                key={`${alb.source}-${alb.id}`}
                type="button"
                onClick={() => onOpenAlbum(alb)}
                className="group lw-glass-card hover:border-[#536716] dark:hover:border-[#C6F100] rounded-2xl p-3 text-left flex flex-col gap-2.5 transition-all cursor-pointer"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0E100C]">
                  <ArtworkImage
                    src={alb.artworkUrl}
                    alt={`${alb.title} — ${alb.artist}`}
                    fallbackLabel={alb.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                  />
                  <span className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-full bg-[#C6F100] text-[#20251E] flex items-center justify-center shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#20251E] dark:text-[#EEF1E6] truncate flex items-center justify-between gap-1">
                    <span className="truncate">{alb.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#5B5E57] dark:text-[#B8BFAE] shrink-0 group-hover:text-[#536716] dark:group-hover:text-[#C6F100]" />
                  </p>
                  <p className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] truncate mt-0.5">
                    {alb.artist}
                  </p>
                  <p className="text-[11px] text-[#5B5E57]/75 dark:text-[#B8BFAE]/70 font-mono tabular-nums mt-0.5 truncate">
                    {alb.genre} · {alb.releaseDate.slice(0, 4)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Spotify / LastWave Tracklist */}
      <section className="lw-glass-card rounded-[22px] overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-[#D6D6CF]/70 dark:border-[#2C3027] flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#20251E] dark:text-[#EEF1E6]">
              {hasActiveSearch
                ? `${t.songsFound} (${filteredSongs.length})`
                : t.liveSongsTitle}
            </h2>
            <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5">{t.syncSongsHint}</p>
          </div>
        </div>

        {/* Column Header Bar */}
        {filteredSongs.length > 0 ? (
          <div className="hidden md:grid grid-cols-[28px_1fr_80px_60px_190px] gap-3 px-5 py-2 border-b border-[#D6D6CF]/60 dark:border-[#2C3027] bg-[#F4F4F0]/70 dark:bg-[#0E100C]/50 text-[11px] font-medium text-[#5B5E57] dark:text-[#B8BFAE]">
            <span className="text-right">#</span>
            <span>{t.colTrack}</span>
            <span className="text-right">{t.colTempo}</span>
            <span className="text-right">{t.colDuration}</span>
            <span className="text-right">{t.colActions}</span>
          </div>
        ) : null}

        {isLoadingFeed && filteredSongs.length === 0 ? (
          <div className="divide-y divide-[#D6D6CF]/60 dark:divide-[#2C3027]">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="px-5 py-3 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-[#ECECE6] dark:bg-[#2C3027] rounded-lg" />
                <div className="flex-1">
                  <div className="h-3.5 bg-[#ECECE6] dark:bg-[#2C3027] rounded w-1/3 mb-1.5" />
                  <div className="h-3 bg-[#ECECE6] dark:bg-[#2C3027] rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <Disc3 className="w-9 h-9 text-[#5B5E57] dark:text-[#B8BFAE] mx-auto mb-2.5" />
            <p className="text-sm font-medium text-[#20251E] dark:text-[#EEF1E6]">
              {t.noSongsFound}
            </p>
            <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] mt-1">{t.noSongsHint}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#D6D6CF]/50 dark:divide-[#2C3027]">
            {filteredSongs.map((song, idx) => {
              const isActive = activeSongId === song.id;
              const isMenuOpen = playlistMenuSongId === song.id;
              const isDownloading = downloadingSongId === song.id;

              return (
                <div
                  key={song.id}
                  className={`px-4 sm:px-5 py-2.5 grid grid-cols-[1fr_auto] md:grid-cols-[28px_1fr_80px_60px_190px] items-center gap-3 transition-colors relative ${
                    isActive
                      ? 'bg-[#C6F100]/15 dark:bg-[#C6F100]/10'
                      : 'hover:bg-[#F4F4F0]/80 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs font-mono tabular-nums text-[#5B5E57] dark:text-[#B8BFAE] text-right hidden md:block">
                    {idx + 1}
                  </span>

                  <div className="flex items-center gap-3 min-w-0">
                    <ArtworkImage
                      src={song.artworkUrl}
                      alt={song.title}
                      fallbackLabel={song.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#D6D6CF] dark:border-[#2C3027]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#20251E] dark:text-[#EEF1E6] truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] truncate">
                        {song.artist} · {song.album} · {song.genre} ·{' '}
                        <span className="font-mono tabular-nums">
                          {song.releaseDate.slice(0, 4)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className="hidden md:block text-right text-xs font-mono tabular-nums text-[#5B5E57] dark:text-[#B8BFAE]">
                    {song.bpm ? `${song.bpm} BPM` : t.bpmAuto}
                  </span>

                  <span className="hidden md:block text-right text-xs font-mono tabular-nums text-[#5B5E57] dark:text-[#B8BFAE]">
                    {formatDuration(song.durationMs)}
                  </span>

                  <div className="flex items-center justify-end gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectSong(song)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#C6F100] text-[#20251E]'
                          : 'bg-[#20251E] dark:bg-[#EEF1E6] hover:opacity-90 text-[#F4F4F0] dark:text-[#20251E]'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <AudioWaveform className="w-3.5 h-3.5" />
                          <span>{t.syncedBtn}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>{t.syncBtn}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={!song.previewUrl || isDownloading}
                      title={song.previewUrl ? downloadT.atmosTitle : downloadT.atmosUnavailable}
                      onClick={() => onDownloadAtmos(song)}
                      aria-label={downloadT.atmosTitle}
                      className="p-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] disabled:opacity-40 text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white cursor-pointer"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#536716] dark:text-[#C6F100]" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setPlaylistMenuSongId(isMenuOpen ? null : song.id)}
                        aria-label={t.saveInPlaylist}
                        className="p-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {isMenuOpen ? (
                        <div className="absolute right-0 top-full mt-1.5 z-30 w-60 bg-[#FBFBFA] dark:bg-[#161912] border border-[#D6D6CF] dark:border-[#2C3027] rounded-2xl shadow-xl p-2.5 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between px-1 pb-1 border-b border-[#D6D6CF]/60 dark:border-[#2C3027]">
                            <span className="text-xs font-bold text-[#20251E] dark:text-[#EEF1E6]">
                              {t.saveInPlaylist}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPlaylistMenuSongId(null)}
                              className="text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {playlists.map((pl) => {
                            const alreadyIn = pl.tracks.some((tr) => tr.id === song.id);
                            const justAdded = addedFeedbackKey === `${pl.id}-${song.id}`;
                            return (
                              <button
                                key={pl.id}
                                type="button"
                                onClick={() => handleAddClick(pl.id, song)}
                                className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#F4F4F0] dark:hover:bg-white/10 text-left text-xs text-[#20251E] dark:text-[#EEF1E6] flex items-center justify-between cursor-pointer"
                              >
                                <span className="truncate">{pl.name}</span>
                                {justAdded || alreadyIn ? (
                                  <Check className="w-3.5 h-3.5 text-[#536716] dark:text-[#C6F100] shrink-0" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5 text-[#5B5E57] dark:text-[#B8BFAE] shrink-0" />
                                )}
                              </button>
                            );
                          })}

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!quickPlName.trim()) return;
                              onQuickCreatePlaylistAndAdd(quickPlName.trim(), song);
                              setQuickPlName('');
                              setPlaylistMenuSongId(null);
                            }}
                            className="pt-1.5 mt-1 border-t border-[#D6D6CF]/60 dark:border-[#2C3027] flex items-center gap-1"
                          >
                            <input
                              type="text"
                              value={quickPlName}
                              onChange={(e) => setQuickPlName(e.target.value)}
                              placeholder={t.newPlaylistInput}
                              className="flex-1 min-w-0 rounded-lg border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-2 py-1 text-xs text-[#20251E] dark:text-[#EEF1E6]"
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-1 rounded-full bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] text-xs font-semibold cursor-pointer"
                            >
                              {t.createBtn}
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => onShareSong(song)}
                      aria-label={`Share ${song.title}`}
                      className="p-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
