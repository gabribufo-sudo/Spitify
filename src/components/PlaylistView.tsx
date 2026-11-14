import { useState } from 'react';
import {
  Plus,
  Play,
  Trash2,
  Pencil,
  Check,
  X,
  Share2,
  ListMusic,
  AudioWaveform,
} from 'lucide-react';
import type { Playlist, SongItem } from '../types/music';
import type { Translations } from '../i18n/translations';
import { ArtworkImage } from './ArtworkImage';

interface PlaylistViewProps {
  t: Translations['playlists'];
  locale: string;
  playlists: Playlist[];
  activeSongId?: string;
  onCreatePlaylist: (name: string, description: string) => void;
  onUpdatePlaylist: (id: string, name: string, description: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRemoveSongFromPlaylist: (playlistId: string, songId: string) => void;
  onSelectSong: (song: SongItem) => void;
  onSharePlaylist: (playlist: Playlist) => void;
  onShareSong: (song: SongItem) => void;
}

export function PlaylistView({
  t,
  locale,
  playlists,
  activeSongId,
  onCreatePlaylist,
  onUpdatePlaylist,
  onDeletePlaylist,
  onRemoveSongFromPlaylist,
  onSelectSong,
  onSharePlaylist,
  onShareSong,
}: PlaylistViewProps) {
  const [selectedId, setSelectedId] = useState<string>(playlists[0]?.id ?? '');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(playlists.length === 0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const activePlaylist = playlists.find((p) => p.id === selectedId) || playlists[0] || null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreatePlaylist(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setShowCreateForm(false);
  };

  const startEdit = (playlist: Playlist) => {
    setEditingId(playlist.id);
    setEditName(playlist.name);
    setEditDesc(playlist.description);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    onUpdatePlaylist(editingId, editName.trim(), editDesc.trim());
    setEditingId(null);
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="lw-glass-card rounded-[22px] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#20251E] dark:text-[#EEF1E6]">
            {t.title}
          </h1>
          <p className="text-sm text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="px-4 py-2 rounded-full bg-[#C6F100] hover:brightness-95 text-[#20251E] text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newPlaylistBtn}</span>
        </button>
      </div>

      {showCreateForm ? (
        <form
          onSubmit={handleCreate}
          className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-3.5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#20251E] dark:text-[#EEF1E6]">{t.createTitle}</h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white cursor-pointer"
            >
              {t.cancel}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-3.5 py-2 text-sm text-[#20251E] dark:text-[#EEF1E6] focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder={t.descPlaceholder}
              className="rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-3.5 py-2 text-sm text-[#20251E] dark:text-[#EEF1E6] focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-[#20251E] dark:bg-[#C6F100] hover:opacity-90 text-[#F4F4F0] dark:text-[#20251E] text-xs font-bold cursor-pointer"
            >
              {t.savePlaylistBtn}
            </button>
          </div>
        </form>
      ) : null}

      {playlists.length === 0 ? (
        <div className="lw-glass-card rounded-[22px] py-14 px-6 text-center">
          <ListMusic className="w-10 h-10 text-[#5B5E57] dark:text-[#B8BFAE] mx-auto mb-3" />
          <h2 className="text-base font-semibold text-[#20251E] dark:text-[#EEF1E6]">{t.emptyTitle}</h2>
          <p className="text-sm text-[#5B5E57] dark:text-[#B8BFAE] mt-1 max-w-md mx-auto">
            {t.emptySubtitle}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 lw-glass-card rounded-[22px] divide-y divide-[#D6D6CF]/60 dark:divide-[#2C3027] overflow-hidden">
            {playlists.map((pl) => {
              const isSelected = activePlaylist?.id === pl.id;
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setSelectedId(pl.id)}
                  className={`w-full p-3.5 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                      : 'hover:bg-[#F4F4F0]/80 dark:hover:bg-white/5 text-[#20251E] dark:text-[#EEF1E6]'
                  }`}
                >
                  <ArtworkImage
                    src={pl.tracks[0]?.artworkUrl}
                    alt={pl.name}
                    fallbackLabel={pl.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{pl.name}</p>
                    <p
                      className={`text-xs truncate mt-0.5 font-mono tabular-nums ${
                        isSelected
                          ? 'text-[#F4F4F0]/75 dark:text-[#20251E]/75'
                          : 'text-[#5B5E57] dark:text-[#B8BFAE]'
                      }`}
                    >
                      {pl.tracks.length} {t.tracksLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {activePlaylist ? (
            <div className="lg:col-span-8 lw-glass-card rounded-[22px] overflow-hidden">
              <div className="p-5 border-b border-[#D6D6CF]/70 dark:border-[#2C3027]">
                {editingId === activePlaylist.id ? (
                  <form onSubmit={saveEdit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-3 py-2 text-sm font-semibold text-[#20251E] dark:text-[#EEF1E6]"
                    />
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder={t.descPlaceholder}
                      className="rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-3 py-2 text-xs text-[#5B5E57] dark:text-[#B8BFAE]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-full bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.saveChangesBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3.5 py-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] text-xs text-[#5B5E57] dark:text-[#B8BFAE] flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{t.cancel}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-[#20251E] dark:text-[#EEF1E6]">
                        {activePlaylist.name}
                      </h2>
                      {activePlaylist.description ? (
                        <p className="text-sm text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5">
                          {activePlaylist.description}
                        </p>
                      ) : null}
                      <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] font-mono tabular-nums mt-1">
                        {activePlaylist.tracks.length} {t.tracksLabel} · {t.updatedLabel}{' '}
                        {new Date(activePlaylist.updatedAt).toLocaleDateString(locale)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSharePlaylist(activePlaylist)}
                        className="px-3.5 py-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] text-xs font-medium text-[#20251E] dark:text-[#EEF1E6] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{t.shareBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(activePlaylist)}
                        aria-label="Edit playlist"
                        className="p-2 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePlaylist(activePlaylist.id)}
                        aria-label="Delete playlist"
                        className="p-2 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#DC2626] hover:text-[#DC2626] text-[#5B5E57] dark:text-[#B8BFAE] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {activePlaylist.tracks.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#5B5E57] dark:text-[#B8BFAE]">
                  {t.emptyTracklist}
                </div>
              ) : (
                <div className="divide-y divide-[#D6D6CF]/60 dark:divide-[#2C3027]">
                  {activePlaylist.tracks.map((track, idx) => {
                    const isActive = activeSongId === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`px-4 py-2.5 flex items-center gap-3 transition-colors ${
                          isActive
                            ? 'bg-[#C6F100]/15 dark:bg-[#C6F100]/10'
                            : 'hover:bg-[#F4F4F0]/80 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="w-5 text-xs font-mono tabular-nums text-[#5B5E57] dark:text-[#B8BFAE] text-right shrink-0">
                          {idx + 1}
                        </span>
                        <ArtworkImage
                          src={track.artworkUrl}
                          alt={track.title}
                          fallbackLabel={track.title}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#20251E] dark:text-[#EEF1E6] truncate">
                            {track.title}
                          </p>
                          <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] truncate">
                            {track.artist} · {track.album}
                            {track.bpm ? ` · ${track.bpm} BPM` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onSelectSong(track)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
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
                            onClick={() => onShareSong(track)}
                            aria-label={`Share ${track.title}`}
                            className="p-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-white cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveSongFromPlaylist(activePlaylist.id, track.id)}
                            aria-label={`Remove ${track.title}`}
                            className="p-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#DC2626] hover:text-[#DC2626] text-[#5B5E57] dark:text-[#B8BFAE] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
