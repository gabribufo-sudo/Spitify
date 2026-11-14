import { useState } from 'react';
import { Sparkles, Download, Disc3, Loader2, Check, AlertCircle } from 'lucide-react';
import type {
  AspectRatioOption,
  GeneratedCover,
  ImageSizeOption,
  SongItem,
} from '../types/music';
import type { Translations } from '../i18n/translations';

interface CoverStudioViewProps {
  t: Translations['covers'];
  activeSong: SongItem | null;
  covers: GeneratedCover[];
  onCoverGenerated: (cover: GeneratedCover) => void;
  onApplyCoverToSong?: (imageUrl: string) => void;
}

const STYLE_PRESETS = [
  {
    id: 'obsidian-copper',
    title: 'Obsidian & Copper Waves',
    thumbnail: '/src/assets/images/cover_analog_synth_1794605673832.jpg',
    prompt:
      'Minimalist contemporary album cover art featuring sculpted acoustic waves in matte obsidian and warm copper, architectural shadows, high-craft vinyl sleeve design',
  },
  {
    id: 'brass-slate',
    title: 'Brass Resonance & Slate',
    thumbnail: '/src/assets/images/cover_orchestral_minimal_1794605674959.jpg',
    prompt:
      'Editorial fine-art vinyl album cover photography of brass resonance rings and smoked glass on dark slate stone, soft directional studio light',
  },
  {
    id: 'analog-console',
    title: 'Analog Mastering Console',
    thumbnail: '/src/assets/images/studio_vinyl_mastering_1794605674517.jpg',
    prompt:
      'Minimalist luxury music mastering console close-up, warm analog VU meters, brushed aluminum dials, shallow depth of field',
  },
];

export function CoverStudioView({
  t,
  activeSong,
  covers,
  onCoverGenerated,
  onApplyCoverToSong,
}: CoverStudioViewProps) {
  const [prompt, setPrompt] = useState(
    activeSong
      ? `Minimalist editorial album cover inspired by "${activeSong.title}" by ${activeSong.artist}, ${activeSong.bpm || 120} BPM, genre ${activeSong.genre}, studio lighting`
      : 'Minimalist contemporary vinyl album cover art with geometric bronze soundwaves on matte charcoal linen, subtle directional lighting'
  );
  const [imageSize, setImageSize] = useState<ImageSizeOption>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const imageSizes: { value: ImageSizeOption; label: string; detail: string }[] = [
    { value: '1K', label: '1K', detail: t.res1k },
    { value: '2K', label: '2K', detail: t.res2k },
    { value: '4K', label: '4K', detail: t.res4k },
  ];

  const aspectRatios: { value: AspectRatioOption; label: string }[] = [
    { value: '1:1', label: t.ratioCover },
    { value: '16:9', label: t.ratioBanner },
    { value: '3:4', label: t.ratioPoster },
    { value: '9:16', label: t.ratioStory },
  ];

  const handleUseSongContext = () => {
    if (!activeSong) return;
    setPrompt(
      `High-craft album cover art inspired by "${activeSong.title}" by ${activeSong.artist} (${activeSong.album}), genre ${activeSong.genre}, energy ${activeSong.bpm || 120} BPM, editorial studio photography`
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/studio/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageSize,
          aspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error generating artwork.');
      }

      const newCover: GeneratedCover = {
        id: `cov-${Date.now()}`,
        imageUrl: data.imageUrl,
        prompt: prompt.trim(),
        size: imageSize,
        aspectRatio,
        songTitle: activeSong?.title,
        artist: activeSong?.artist,
        createdAt: Date.now(),
      };
      onCoverGenerated(newCover);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (cover: GeneratedCover) => {
    const a = document.createElement('a');
    a.href = cover.imageUrl;
    a.download = `ritmostudio-cover-${cover.size.toLowerCase()}-${cover.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D6D6CF]/70 dark:border-[#2C3027] pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#20251E] dark:text-[#EEF1E6]">
              {t.title}
            </h1>
            <p className="text-sm text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5 max-w-2xl">
              {t.subtitlePrefix}{' '}
              <span className="font-mono text-xs text-[#20251E] dark:text-[#C6F100]">
                gemini-3-pro-image-preview
              </span>{' '}
              {t.subtitleSuffix}
            </p>
          </div>
          {activeSong ? (
            <button
              type="button"
              onClick={handleUseSongContext}
              className="px-3.5 py-2 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] hover:border-[#536716] dark:hover:border-[#C6F100] text-xs font-medium text-[#20251E] dark:text-[#EEF1E6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.adaptToSong} ({activeSong.title})
            </button>
          ) : null}
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="cover-prompt"
              className="block text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] mb-1.5"
            >
              {t.promptLabel}
            </label>
            <textarea
              id="cover-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.promptPlaceholder}
              className="w-full rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-4 py-2.5 text-sm text-[#20251E] dark:text-[#EEF1E6] placeholder:text-[#5B5E57]/60 focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE]">
                {t.resolutionLabel}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {imageSizes.map((item) => {
                  const active = imageSize === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setImageSize(item.value)}
                      className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#20251E] dark:bg-[#C6F100] border-[#20251E] dark:border-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                          : 'bg-[#F4F4F0]/80 dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#20251E] dark:text-[#EEF1E6] hover:border-[#536716] dark:hover:border-[#C6F100]'
                      }`}
                    >
                      <div className="text-sm font-mono font-bold tabular-nums">{item.label}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          active
                            ? 'text-[#F4F4F0]/75 dark:text-[#20251E]/75'
                            : 'text-[#5B5E57] dark:text-[#B8BFAE]'
                        }`}
                      >
                        {item.detail}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE]">
                {t.formatLabel}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {aspectRatios.map((ratio) => {
                  const active = aspectRatio === ratio.value;
                  return (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`px-2.5 py-2.5 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-[#20251E] dark:bg-[#C6F100] border-[#20251E] dark:border-[#C6F100] text-[#F4F4F0] dark:text-[#20251E] font-semibold'
                          : 'bg-[#F4F4F0]/80 dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#20251E] dark:text-[#EEF1E6] hover:border-[#536716] dark:hover:border-[#C6F100]'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE]">
              {t.presetsLabel}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPrompt(preset.prompt)}
                  className="flex items-center gap-3 p-2 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0]/80 dark:bg-white/5 hover:border-[#536716] dark:hover:border-[#C6F100] text-left transition-colors cursor-pointer"
                >
                  <img
                    src={preset.thumbnail}
                    alt={preset.title}
                    className="w-11 h-11 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#20251E] dark:text-[#EEF1E6] truncate">
                      {preset.title}
                    </p>
                    <p className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5 truncate">
                      {t.loadStyleHint}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {errorMsg ? (
            <div
              role="alert"
              className="rounded-xl border border-[#DC2626]/25 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#B91C1C] flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-end pt-1">
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2.5 rounded-full bg-[#C6F100] hover:brightness-95 disabled:opacity-50 text-[#20251E] text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.generatingBtn} ({imageSize})</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.generateBtn} {imageSize}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="lw-glass-card rounded-[22px] p-5">
        <h2 className="text-base font-bold text-[#20251E] dark:text-[#EEF1E6] mb-4">
          {t.galleryTitle} ({covers.length})
        </h2>

        {covers.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[#D6D6CF] dark:border-[#2C3027] rounded-2xl">
            <Disc3 className="w-8 h-8 text-[#5B5E57] dark:text-[#B8BFAE] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#20251E] dark:text-[#EEF1E6]">{t.emptyTitle}</p>
            <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] mt-1">{t.emptySubtitle}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {covers.map((cover) => (
              <article
                key={cover.id}
                className="border border-[#D6D6CF] dark:border-[#2C3027] rounded-2xl overflow-hidden bg-[#FBFBFA] dark:bg-[#161912] flex flex-col"
              >
                <div className="aspect-square bg-[#0E100C] overflow-hidden">
                  <img
                    src={cover.imageUrl}
                    alt={cover.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3.5 flex flex-col gap-2.5 flex-1 justify-between">
                  <div>
                    <div className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] font-mono tabular-nums mb-1">
                      {cover.size} · {cover.aspectRatio}
                      {cover.songTitle ? ` · ${cover.songTitle}` : ''}
                    </div>
                    <p className="text-xs text-[#20251E] dark:text-[#EEF1E6]/90 line-clamp-2 leading-relaxed">
                      {cover.prompt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#D6D6CF]/60 dark:border-[#2C3027]">
                    <button
                      type="button"
                      onClick={() => handleDownload(cover)}
                      className="flex-1 py-1.5 px-3 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] text-xs font-medium text-[#20251E] dark:text-[#EEF1E6] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloadBtn}</span>
                    </button>
                    {onApplyCoverToSong && activeSong ? (
                      <button
                        type="button"
                        onClick={() => {
                          onApplyCoverToSong(cover.imageUrl);
                          setAppliedId(cover.id);
                        }}
                        className="flex-1 py-1.5 px-3 rounded-full bg-[#20251E] dark:bg-[#C6F100] hover:opacity-90 text-xs font-semibold text-[#F4F4F0] dark:text-[#20251E] flex items-center justify-center gap-1.5 transition-opacity cursor-pointer"
                      >
                        {appliedId === cover.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.appliedBtn}</span>
                          </>
                        ) : (
                          <span>{t.applyToSongBtn}</span>
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
