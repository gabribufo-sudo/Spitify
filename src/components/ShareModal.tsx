import { useState } from 'react';
import { X, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import type { Playlist, SongItem } from '../types/music';
import type { Translations } from '../i18n/translations';
import { ArtworkImage } from './ArtworkImage';

export type ShareTarget =
  | { type: 'song'; song: SongItem }
  | { type: 'playlist'; playlist: Playlist };

interface ShareModalProps {
  target: ShareTarget | null;
  t: Translations['share'];
  onClose: () => void;
}

export function ShareModal({ target, t, onClose }: ShareModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!target) return null;

  const baseAppUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const shareUrl =
    target.type === 'song'
      ? target.song.externalUrl || `${baseAppUrl}?song=${encodeURIComponent(target.song.title)}`
      : `${baseAppUrl}?playlist=${encodeURIComponent(target.playlist.name)}`;

  const shareText =
    target.type === 'song'
      ? `${t.listeningText} "${target.song.title}" — ${target.song.artist}${
          target.song.bpm ? ` (${target.song.bpm} BPM)` : ''
        } · RitmoStudio`
      : `${t.playlistText} "${target.playlist.name}" (${
          target.playlist.tracks.length
        }): ${target.playlist.tracks
          .slice(0, 5)
          .map((tr) => `${tr.title} - ${tr.artist}`)
          .join(', ')}${target.playlist.tracks.length > 5 ? '...' : ''}`;

  const instagramCaption =
    target.type === 'song'
      ? `${target.song.title} — ${target.song.artist}\nAlbum: ${target.song.album}${
          target.song.bpm ? ` · ${target.song.bpm} BPM` : ''
        }\n#RitmoStudio #Music #Metronome`
      : `Playlist: ${target.playlist.name}\n${target.playlist.tracks
          .slice(0, 6)
          .map((tr, idx) => `${idx + 1}. ${tr.title} — ${tr.artist}`)
          .join('\n')}\n#RitmoStudio #Playlist`;

  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}&quote=${encodeURIComponent(shareText)}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  const handleCopy = async (key: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      // Ignore if clipboard blocked
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: target.type === 'song' ? target.song.title : target.playlist.name,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User dismissed share sheet
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0E100C]/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={target.type === 'song' ? t.shareSongTitle : t.sharePlaylistTitle}
    >
      <div className="bg-[#FBFBFA] dark:bg-[#161912] border border-[#D6D6CF] dark:border-[#2C3027] rounded-[22px] max-w-md w-full overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-[#D6D6CF]/70 dark:border-[#2C3027] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#20251E] dark:text-[#EEF1E6]">
            {target.type === 'song' ? t.shareSongTitle : t.sharePlaylistTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full hover:bg-[#F4F4F0] dark:hover:bg-white/10 flex items-center justify-center text-[#5B5E57] dark:text-[#B8BFAE] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F4F4F0] dark:bg-[#0E100C] border border-[#D6D6CF] dark:border-[#2C3027]">
            <ArtworkImage
              src={
                target.type === 'song'
                  ? target.song.artworkUrl
                  : target.playlist.tracks[0]?.artworkUrl
              }
              alt={target.type === 'song' ? target.song.title : target.playlist.name}
              fallbackLabel={target.type === 'song' ? target.song.title : target.playlist.name}
              className="w-14 h-14 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#20251E] dark:text-[#EEF1E6] truncate">
                {target.type === 'song' ? target.song.title : target.playlist.name}
              </p>
              <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] truncate mt-0.5">
                {target.type === 'song'
                  ? `${target.song.artist} · ${target.song.album}`
                  : `${target.playlist.tracks.length} ${t.tracksInPlaylist}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#1877F2] hover:bg-[#1877F2]/10 text-xs font-semibold text-[#20251E] dark:text-[#EEF1E6] flex items-center justify-between transition-colors"
            >
              <span>Facebook</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#5B5E57] dark:text-[#B8BFAE]" />
            </a>

            <a
              href={twitterHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#20251E] dark:hover:border-[#C6F100] hover:bg-[#20251E]/5 dark:hover:bg-white/10 text-xs font-semibold text-[#20251E] dark:text-[#EEF1E6] flex items-center justify-between transition-colors"
            >
              <span>X / Twitter</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#5B5E57] dark:text-[#B8BFAE]" />
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] hover:bg-[#536716]/10 text-xs font-semibold text-[#20251E] dark:text-[#EEF1E6] flex items-center justify-between transition-colors"
            >
              <span>WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#5B5E57] dark:text-[#B8BFAE]" />
            </a>

            <button
              type="button"
              onClick={() => void handleCopy('instagram', instagramCaption)}
              className="px-4 py-2.5 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] hover:bg-[#C6F100]/15 text-xs font-semibold text-[#20251E] dark:text-[#EEF1E6] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>{copiedKey === 'instagram' ? t.copiedInstagram : t.copyInstagram}</span>
              {copiedKey === 'instagram' ? (
                <Check className="w-3.5 h-3.5 text-[#536716] dark:text-[#C6F100]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#5B5E57] dark:text-[#B8BFAE]" />
              )}
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#D6D6CF]/70 dark:border-[#2C3027]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                aria-label="Share URL"
                className="flex-1 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-3 py-2 text-xs font-mono text-[#5B5E57] dark:text-[#B8BFAE] truncate"
              />
              <button
                type="button"
                onClick={() => void handleCopy('link', `${shareText} ${shareUrl}`)}
                className="px-3.5 py-2 rounded-full bg-[#20251E] dark:bg-[#C6F100] hover:opacity-90 text-[#F4F4F0] dark:text-[#20251E] text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                {copiedKey === 'link' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copy}</span>
                  </>
                )}
              </button>
            </div>

            {typeof navigator !== 'undefined' && 'share' in navigator ? (
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                className="w-full py-2.5 px-4 rounded-full bg-[#C6F100] hover:brightness-95 text-[#20251E] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.nativeShare}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
