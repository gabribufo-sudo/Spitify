import { useMemo } from 'react';
import {
  Play,
  AudioWaveform,
  Trash2,
  Download,
  Loader2,
  Clock,
  BarChart3,
} from 'lucide-react';
import type { ListeningEntry, SongItem } from '../types/music';
import type { Translations } from '../i18n/translations';
import { ArtworkImage } from './ArtworkImage';

interface HistoryStatsViewProps {
  t: Translations['history'];
  downloadT: Translations['download'];
  syncLabel: string;
  syncedLabel: string;
  locale: string;
  entries: ListeningEntry[];
  activeSongId?: string;
  downloadingSongId: string | null;
  onSelectSong: (song: SongItem) => void;
  onDownloadAtmos: (song: SongItem) => void;
  onClearHistory: () => void;
}

export function HistoryStatsView({
  t,
  downloadT,
  syncLabel,
  syncedLabel,
  locale,
  entries,
  activeSongId,
  downloadingSongId,
  onSelectSong,
  onDownloadAtmos,
  onClearHistory,
}: HistoryStatsViewProps) {
  const stats = useMemo(() => {
    if (entries.length === 0) {
      return {
        totalPlays: 0,
        uniqueCount: 0,
        avgBpm: 0,
        topGenre: t.noDataYet,
        topArtist: t.noDataYet,
        bpmBuckets: [
          { label: '< 90 BPM', count: 0 },
          { label: '90–115 BPM', count: 0 },
          { label: '116–135 BPM', count: 0 },
          { label: '> 135 BPM', count: 0 },
        ],
        topGenres: [] as { name: string; count: number }[],
      };
    }

    let totalPlays = 0;
    let bpmWeightedSum = 0;
    const genreCounts = new Map<string, number>();
    const artistCounts = new Map<string, number>();
    const buckets = [
      { label: '< 90 BPM', count: 0 },
      { label: '90–115 BPM', count: 0 },
      { label: '116–135 BPM', count: 0 },
      { label: '> 135 BPM', count: 0 },
    ];

    for (const entry of entries) {
      const weight = entry.playCount || 1;
      totalPlays += weight;
      const bpm = entry.bpmSynced || entry.song.bpm || 120;
      bpmWeightedSum += bpm * weight;

      if (bpm < 90) buckets[0].count += weight;
      else if (bpm <= 115) buckets[1].count += weight;
      else if (bpm <= 135) buckets[2].count += weight;
      else buckets[3].count += weight;

      const genre = entry.song.genre || 'Pop';
      genreCounts.set(genre, (genreCounts.get(genre) || 0) + weight);

      const artist = entry.song.artist || 'Artist';
      artistCounts.set(artist, (artistCounts.get(artist) || 0) + weight);
    }

    const sortedGenres = [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const sortedArtists = [...artistCounts.entries()].sort((a, b) => b[1] - a[1]);

    return {
      totalPlays,
      uniqueCount: entries.length,
      avgBpm: Math.round(bpmWeightedSum / totalPlays),
      topGenre: sortedGenres[0]?.name || t.noDataYet,
      topArtist: sortedArtists[0]?.[0] || t.noDataYet,
      bpmBuckets: buckets,
      topGenres: sortedGenres.slice(0, 4),
    };
  }, [entries, t.noDataYet]);

  const maxBucket = Math.max(1, ...stats.bpmBuckets.map((b) => b.count));
  const maxGenre = Math.max(1, ...stats.topGenres.map((g) => g.count));

  return (
    <section className="flex flex-col gap-5">
      {/* Header */}
      <div className="lw-glass-card rounded-[22px] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#20251E] dark:text-[#EEF1E6]">
            {t.title}
          </h1>
          <p className="text-sm text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5">{t.subtitle}</p>
        </div>
        {entries.length > 0 ? (
          <button
            type="button"
            onClick={onClearHistory}
            className="px-3.5 py-2 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#DC2626] hover:text-[#DC2626] text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearBtn}</span>
          </button>
        ) : null}
      </div>

      {/* 4 Clean KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="lw-glass-card rounded-[20px] p-4">
          <span className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] block">{t.statPlays}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold tabular-nums text-[#20251E] dark:text-[#EEF1E6]">
              {stats.totalPlays}
            </span>
            <span className="text-xs font-mono tabular-nums text-[#5B5E57] dark:text-[#B8BFAE]">
              ({stats.uniqueCount} {t.statUnique.toLowerCase()})
            </span>
          </div>
        </div>

        <div className="lw-glass-card rounded-[20px] p-4">
          <span className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] block">{t.statAvgBpm}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold tabular-nums text-[#20251E] dark:text-[#EEF1E6]">
              {stats.avgBpm || '—'}
            </span>
            {stats.avgBpm ? (
              <span className="text-xs font-mono text-[#5B5E57] dark:text-[#B8BFAE]">BPM</span>
            ) : null}
          </div>
        </div>

        <div className="lw-glass-card rounded-[20px] p-4">
          <span className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] block">{t.statTopGenre}</span>
          <p className="mt-1 text-base font-semibold text-[#20251E] dark:text-[#EEF1E6] truncate">
            {stats.topGenre}
          </p>
        </div>

        <div className="lw-glass-card rounded-[20px] p-4">
          <span className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] block">{t.statTopArtist}</span>
          <p className="mt-1 text-base font-semibold text-[#20251E] dark:text-[#EEF1E6] truncate">
            {stats.topArtist}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="lw-glass-card rounded-[22px] py-14 px-6 text-center">
          <BarChart3 className="w-10 h-10 text-[#5B5E57] dark:text-[#B8BFAE] mx-auto mb-3" />
          <h2 className="text-base font-semibold text-[#20251E] dark:text-[#EEF1E6]">
            {t.emptyTitle}
          </h2>
          <p className="text-sm text-[#5B5E57] dark:text-[#B8BFAE] mt-1 max-w-md mx-auto">
            {t.emptySubtitle}
          </p>
        </div>
      ) : (
        <>
          {/* Real Breakdown Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-3">
              <h2 className="text-sm font-bold text-[#20251E] dark:text-[#EEF1E6]">
                {t.bpmDistributionTitle}
              </h2>
              <div className="flex flex-col gap-2.5">
                {stats.bpmBuckets.map((bucket) => (
                  <div key={bucket.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#5B5E57] dark:text-[#B8BFAE]">
                        {bucket.label}
                      </span>
                      <span className="font-mono tabular-nums font-medium text-[#20251E] dark:text-[#EEF1E6]">
                        {bucket.count}
                      </span>
                    </div>
                    <div className="h-2 bg-[#ECECE6] dark:bg-[#2C3027] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#20251E] dark:bg-[#EEF1E6] rounded-full transition-[width] duration-200"
                        style={{ width: `${(bucket.count / maxBucket) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-3">
              <h2 className="text-sm font-bold text-[#20251E] dark:text-[#EEF1E6]">
                {t.genreBreakdownTitle}
              </h2>
              <div className="flex flex-col gap-2.5">
                {stats.topGenres.map((g) => (
                  <div key={g.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#20251E] dark:text-[#EEF1E6] font-medium truncate">
                        {g.name}
                      </span>
                      <span className="font-mono tabular-nums text-[#5B5E57] dark:text-[#B8BFAE]">
                        {g.count}
                      </span>
                    </div>
                    <div className="h-2 bg-[#ECECE6] dark:bg-[#2C3027] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#536716] dark:bg-[#C6F100] rounded-full transition-[width] duration-200"
                        style={{ width: `${(g.count / maxGenre) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Listening History Table */}
          <div className="lw-glass-card rounded-[22px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#D6D6CF]/70 dark:border-[#2C3027] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#20251E] dark:text-[#EEF1E6] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#536716] dark:text-[#C6F100]" />
                <span>
                  {t.recentTracksTitle} ({entries.length})
                </span>
              </h2>
            </div>

            <div className="divide-y divide-[#D6D6CF]/60 dark:divide-[#2C3027]">
              {entries.map((entry) => {
                const { song } = entry;
                const isActive = activeSongId === song.id;
                const isDownloading = downloadingSongId === song.id;
                return (
                  <div
                    key={entry.id}
                    className={`px-4 sm:px-5 py-3 flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-[#C6F100]/15 dark:bg-[#C6F100]/10'
                        : 'hover:bg-[#F4F4F0]/80 dark:hover:bg-white/5'
                    }`}
                  >
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
                      <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] truncate mt-0.5">
                        {song.artist} · {song.genre} ·{' '}
                        <span className="font-mono tabular-nums">
                          {entry.bpmSynced} BPM · {entry.playCount} {t.playsUnit} ·{' '}
                          {new Date(entry.playedAt).toLocaleString(locale, {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectSong(song)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#C6F100] text-[#20251E]'
                            : 'bg-[#20251E] dark:bg-[#EEF1E6] hover:opacity-90 text-[#F4F4F0] dark:text-[#20251E]'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <AudioWaveform className="w-3.5 h-3.5" />
                            <span>{syncedLabel}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>{syncLabel}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={!song.previewUrl || isDownloading}
                        title={song.previewUrl ? downloadT.atmosTitle : downloadT.atmosUnavailable}
                        onClick={() => onDownloadAtmos(song)}
                        className="px-3 py-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] disabled:opacity-40 text-xs font-medium text-[#20251E] dark:text-[#EEF1E6] flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#536716] dark:text-[#C6F100]" />
                            <span className="hidden sm:inline">{downloadT.atmosProcessing}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{downloadT.atmosBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
