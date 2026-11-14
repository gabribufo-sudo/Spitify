import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import type { Content } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  if (lower.includes('403') || lower.includes('permission_denied') || lower.includes('api_key_invalid')) {
    return {
      status: 403,
      message:
        'Chiave API Gemini mancante, non valida o non abilitata per questo modello. Verifica la configurazione in Settings > Secrets.',
    };
  }
  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return {
      status: 429,
      message:
        'Quota API esaurita o modello riservato a chiave API a pagamento. Seleziona una chiave con fatturazione in Settings > Secrets oppure prova gemini-4-hydrogen / gemini-3.1-flash-lite.',
    };
  }
  if (lower.includes('404') || lower.includes('not_found')) {
    return {
      status: 404,
      message: `Modello richiesto non disponibile al momento (${raw}).`,
    };
  }
  return {
    status: 500,
    message: `Errore durante la chiamata Gemini: ${raw}`,
  };
}

interface CachedBpm {
  bpm: number;
  timeSignature: string;
  musicalKey: string;
  bpmSource: 'deezer' | 'gemini' | 'estimated';
}

const bpmCache = new Map<string, CachedBpm>();

function upscaleArtwork(url: string | undefined, size = 600): string {
  if (!url) return '';
  return url
    .replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`)
    .replace(/\/\d+x\d+\./, `/${size}x${size}.`);
}

function parseItunesRssDate(raw: string | undefined): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return raw;
  return new Date(parsed).toISOString().slice(0, 10);
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 8000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RitmoStudio/1.0',
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function estimateGenreBpm(genre: string): number {
  const g = genre.toLowerCase();
  if (g.includes('techno') || g.includes('house') || g.includes('dance') || g.includes('electronic')) return 126;
  if (g.includes('drum') || g.includes('dnb')) return 172;
  if (g.includes('hip-hop') || g.includes('hip hop') || g.includes('rap') || g.includes('trap')) return 96;
  if (g.includes('rock') || g.includes('metal') || g.includes('punk')) return 132;
  if (g.includes('jazz') || g.includes('soul') || g.includes('r&b')) return 92;
  if (g.includes('latin') || g.includes('reggaeton')) return 98;
  if (g.includes('classica') || g.includes('classical')) return 84;
  return 118;
}

app.get('/api/music/feed', async (req, res) => {
  const country = String(req.query.country || 'it').toLowerCase() === 'us' ? 'us' : 'it';
  const kind = String(req.query.kind || 'all');

  try {
    const [topSongsRss, topAlbumsRss, deezerNewReleases, deezerTopTracks] = await Promise.allSettled([
      fetchJsonWithTimeout(`https://itunes.apple.com/${country}/rss/topsongs/limit=25/json`),
      fetchJsonWithTimeout(`https://itunes.apple.com/${country}/rss/topalbums/limit=20/json`),
      fetchJsonWithTimeout('https://api.deezer.com/editorial/0/releases?limit=24'),
      fetchJsonWithTimeout('https://api.deezer.com/chart/0/tracks?limit=25'),
    ]);

    const songIds: string[] = [];
    const rssEntries: any[] =
      topSongsRss.status === 'fulfilled' ? topSongsRss.value?.feed?.entry ?? [] : [];
    for (const entry of rssEntries) {
      const id = entry?.id?.attributes?.['im:id'];
      if (id) songIds.push(String(id));
    }

    let lookupMap = new Map<string, any>();
    if (songIds.length > 0) {
      try {
        const lookupData = await fetchJsonWithTimeout(
          `https://itunes.apple.com/lookup?id=${songIds.join(',')}&country=${country.toUpperCase()}`
        );
        for (const item of lookupData?.results ?? []) {
          if (item.trackId) {
            lookupMap.set(String(item.trackId), item);
          }
        }
      } catch {
        // Ignore lookup error and rely on RSS fields
      }
    }

    const songs: any[] = [];
    const seenKeys = new Set<string>();

    for (const entry of rssEntries) {
      const id = String(entry?.id?.attributes?.['im:id'] ?? '');
      const detail = lookupMap.get(id);
      const title = detail?.trackName || entry?.['im:name']?.label || 'Brano sconosciuto';
      const artist = detail?.artistName || entry?.['im:artist']?.label || 'Artista';
      const key = `${title.toLowerCase()}::${artist.toLowerCase()}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const imgs = entry?.['im:image'] ?? [];
      const rawArt = detail?.artworkUrl100 || imgs[imgs.length - 1]?.label || '';
      const genre = detail?.primaryGenreName || entry?.category?.attributes?.label || 'Pop';
      const cached = bpmCache.get(key);

      songs.push({
        id: `itunes-${id}`,
        source: 'itunes',
        title,
        artist,
        album: detail?.collectionName || entry?.['im:collection']?.['im:name']?.label || 'Singolo',
        albumId: detail?.collectionId ? String(detail.collectionId) : undefined,
        artworkUrl: upscaleArtwork(rawArt, 600),
        previewUrl: detail?.previewUrl || undefined,
        releaseDate: parseItunesRssDate(detail?.releaseDate || entry?.['im:releaseDate']?.label),
        genre,
        durationMs: detail?.trackTimeMillis || 180000,
        bpm: cached?.bpm,
        timeSignature: cached?.timeSignature || '4/4',
        musicalKey: cached?.musicalKey,
        bpmSource: cached?.bpmSource,
        externalUrl: detail?.trackViewUrl || entry?.link?.attributes?.href,
      });
    }

    if (deezerTopTracks.status === 'fulfilled') {
      for (const tr of deezerTopTracks.value?.data ?? []) {
        const title = tr.title_short || tr.title;
        const artist = tr.artist?.name || 'Artista';
        const key = `${String(title).toLowerCase()}::${String(artist).toLowerCase()}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        songs.push({
          id: `deezer-${tr.id}`,
          source: 'deezer',
          title,
          artist,
          album: tr.album?.title || 'Singolo',
          albumId: tr.album?.id ? String(tr.album.id) : undefined,
          artworkUrl: tr.album?.cover_big || tr.album?.cover_medium || '',
          previewUrl: tr.preview || undefined,
          releaseDate: new Date().toISOString().slice(0, 10),
          genre: 'Chart Globale',
          durationMs: (tr.duration || 180) * 1000,
          bpm: tr.bpm && tr.bpm > 0 ? Math.round(tr.bpm) : undefined,
          timeSignature: '4/4',
          bpmSource: tr.bpm && tr.bpm > 0 ? 'deezer' : undefined,
          externalUrl: tr.link,
        });
      }
    }

    const albums: any[] = [];
    const seenAlbums = new Set<string>();

    if (deezerNewReleases.status === 'fulfilled') {
      for (const alb of deezerNewReleases.value?.data ?? []) {
        const key = `${String(alb.title).toLowerCase()}::${String(alb.artist?.name || '').toLowerCase()}`;
        if (seenAlbums.has(key)) continue;
        seenAlbums.add(key);
        albums.push({
          id: String(alb.id),
          source: 'deezer',
          title: alb.title,
          artist: alb.artist?.name || 'Artista',
          artworkUrl: alb.cover_big || alb.cover_medium || '',
          releaseDate: alb.release_date || new Date().toISOString().slice(0, 10),
          genre: alb.record_type === 'single' ? 'Nuovo Singolo' : 'Nuovo Album',
          externalUrl: alb.link,
        });
      }
    }

    const rssAlbums: any[] =
      topAlbumsRss.status === 'fulfilled' ? topAlbumsRss.value?.feed?.entry ?? [] : [];
    for (const entry of rssAlbums) {
      const id = String(entry?.id?.attributes?.['im:id'] ?? '');
      const title = entry?.['im:name']?.label || 'Album';
      const artist = entry?.['im:artist']?.label || 'Artista';
      const key = `${title.toLowerCase()}::${artist.toLowerCase()}`;
      if (seenAlbums.has(key)) continue;
      seenAlbums.add(key);

      const imgs = entry?.['im:image'] ?? [];
      const rawArt = imgs[imgs.length - 1]?.label || '';
      albums.push({
        id,
        source: 'itunes',
        title,
        artist,
        artworkUrl: upscaleArtwork(rawArt, 600),
        releaseDate: parseItunesRssDate(entry?.['im:releaseDate']?.label),
        genre: entry?.category?.attributes?.label || 'Album',
        trackCount: entry?.['im:itemCount']?.label ? Number(entry['im:itemCount'].label) : undefined,
        externalUrl: entry?.link?.attributes?.href,
      });
    }

    // Sort newest albums first by release date descending
    albums.sort((a, b) => String(b.releaseDate).localeCompare(String(a.releaseDate)));

    res.json({
      songs: kind === 'albums' ? [] : songs,
      albums: kind === 'songs' ? [] : albums,
      fetchedAt: new Date().toISOString(),
      country,
    });
  } catch (err) {
    res.status(502).json({
      error: 'Impossibile recuperare il feed musicale live al momento.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

function matchesYearFilter(releaseDate: string | undefined, yearFilter: string): boolean {
  if (!yearFilter) return true;
  const yearMatch = String(releaseDate || '').match(/\d{4}/);
  if (!yearMatch) return false;
  const itemYear = Number(yearMatch[0]);
  if (!Number.isFinite(itemYear)) return false;

  const trimmed = yearFilter.trim();
  if (/^\d{4}$/.test(trimmed)) {
    return itemYear === Number(trimmed);
  }
  if (/^<\d{4}$/.test(trimmed)) {
    return itemYear < Number(trimmed.slice(1));
  }
  const rangeMatch = trimmed.match(/^(\d{4})-(\d{4})$/);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    return itemYear >= start && itemYear <= end;
  }
  return String(releaseDate || '').includes(trimmed);
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

function matchesGenreFilter(itemGenre: string | undefined, selectedGenre: string): boolean {
  if (!selectedGenre || selectedGenre === 'Tutti') return true;
  const gLower = String(itemGenre || '').toLowerCase();
  const selLower = selectedGenre.toLowerCase();
  const aliases = GENRE_ALIASES[selLower] || [selLower];
  return aliases.some((alias) => gLower.includes(alias));
}


app.get('/api/music/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const artist = String(req.query.artist || '').trim();
  const album = String(req.query.album || '').trim();
  const genre = String(req.query.genre || '').trim();
  const year = String(req.query.year || '').trim();
  const type = String(req.query.type || 'all');

  const combinedTerms = [q, artist, album, genre !== 'Tutti' ? genre : '', /^\d{4}$/.test(year) ? year : '']
    .filter(Boolean)
    .join(' ')
    .trim();

  if (!combinedTerms) {
    res.json({ songs: [], albums: [] });
    return;
  }

  let attributeParam = '';
  if (artist && !q && !album) {
    attributeParam = '&attribute=artistTerm';
  } else if (album && !q && !artist) {
    attributeParam = '&attribute=albumTerm';
  }

  const itunesTerm = encodeURIComponent(
    [q, artist, album].filter(Boolean).join(' ').trim() || combinedTerms
  );
  const deezerTerm = encodeURIComponent(
    [
      q,
      artist ? `artist:"${artist}"` : '',
      album ? `album:"${album}"` : '',
      !q && !artist && !album ? combinedTerms : '',
    ]
      .filter(Boolean)
      .join(' ')
      .trim()
  );

  try {
    const [itunesSongs, itunesAlbums, deezerTracks] = await Promise.allSettled([
      type !== 'album'
        ? fetchJsonWithTimeout(
            `https://itunes.apple.com/search?term=${itunesTerm}&country=IT&media=music&entity=song&limit=50${attributeParam}`
          )
        : Promise.resolve({ results: [] }),
      type !== 'song'
        ? fetchJsonWithTimeout(
            `https://itunes.apple.com/search?term=${itunesTerm}&country=IT&media=music&entity=album&limit=35${attributeParam}`
          )
        : Promise.resolve({ results: [] }),
      type !== 'album'
        ? fetchJsonWithTimeout(`https://api.deezer.com/search/track?q=${deezerTerm}&limit=20`)
        : Promise.resolve({ data: [] }),
    ]);

    const artistLower = artist.toLowerCase();
    const albumLower = album.toLowerCase();
    const genreLower = genre && genre !== 'Tutti' ? genre.toLowerCase() : '';

    const songs: any[] = [];
    const seenSongs = new Set<string>();

    if (itunesSongs.status === 'fulfilled') {
      for (const item of itunesSongs.value?.results ?? []) {
        const songTitle = String(item.trackName || '');
        const songArtist = String(item.artistName || '');
        const songAlbum = String(item.collectionName || 'Singolo');
        const songGenre = String(item.primaryGenreName || 'Musica');
        const songDate = parseItunesRssDate(item.releaseDate);

        if (artistLower && !songArtist.toLowerCase().includes(artistLower)) continue;
        if (albumLower && !songAlbum.toLowerCase().includes(albumLower)) continue;
        if (genreLower && !matchesGenreFilter(songGenre, genre)) continue;
        if (year && !matchesYearFilter(songDate, year)) continue;

        const key = `${songTitle.toLowerCase()}::${songArtist.toLowerCase()}`;
        if (seenSongs.has(key)) continue;
        seenSongs.add(key);
        const cached = bpmCache.get(key);
        songs.push({
          id: `itunes-${item.trackId}`,
          source: 'itunes',
          title: songTitle,
          artist: songArtist,
          album: songAlbum,
          albumId: item.collectionId ? String(item.collectionId) : undefined,
          artworkUrl: upscaleArtwork(item.artworkUrl100, 600),
          previewUrl: item.previewUrl || undefined,
          releaseDate: songDate,
          genre: songGenre,
          durationMs: item.trackTimeMillis || 180000,
          bpm: cached?.bpm,
          timeSignature: cached?.timeSignature || '4/4',
          musicalKey: cached?.musicalKey,
          bpmSource: cached?.bpmSource,
          externalUrl: item.trackViewUrl,
        });
      }
    }

    if (deezerTracks.status === 'fulfilled') {
      for (const tr of deezerTracks.value?.data ?? []) {
        const title = String(tr.title_short || tr.title || '');
        const trArtist = String(tr.artist?.name || 'Artista');
        const trAlbum = String(tr.album?.title || 'Singolo');

        if (artistLower && !trArtist.toLowerCase().includes(artistLower)) continue;
        if (albumLower && !trAlbum.toLowerCase().includes(albumLower)) continue;
        // Deezer track search does not always return releaseDate or genre; keep if year/genre not strictly excluding
        if (year && !year.startsWith('202')) continue;

        const key = `${title.toLowerCase()}::${trArtist.toLowerCase()}`;
        if (seenSongs.has(key)) continue;
        seenSongs.add(key);
        songs.push({
          id: `deezer-${tr.id}`,
          source: 'deezer',
          title,
          artist: trArtist,
          album: trAlbum,
          albumId: tr.album?.id ? String(tr.album.id) : undefined,
          artworkUrl: tr.album?.cover_big || tr.album?.cover_medium || '',
          previewUrl: tr.preview || undefined,
          releaseDate: new Date().toISOString().slice(0, 10),
          genre: genreLower ? genre : 'Musica',
          durationMs: (tr.duration || 180) * 1000,
          bpm: tr.bpm && tr.bpm > 0 ? Math.round(tr.bpm) : undefined,
          timeSignature: '4/4',
          bpmSource: tr.bpm && tr.bpm > 0 ? 'deezer' : undefined,
          externalUrl: tr.link,
        });
      }
    }

    const albums: any[] = [];
    const seenAlbums = new Set<string>();
    if (itunesAlbums.status === 'fulfilled') {
      for (const item of itunesAlbums.value?.results ?? []) {
        const albTitle = String(item.collectionName || '');
        const albArtist = String(item.artistName || '');
        const albGenre = String(item.primaryGenreName || 'Album');
        const albDate = parseItunesRssDate(item.releaseDate);

        if (artistLower && !albArtist.toLowerCase().includes(artistLower)) continue;
        if (albumLower && !albTitle.toLowerCase().includes(albumLower)) continue;
        if (genreLower && !matchesGenreFilter(albGenre, genre)) continue;
        if (year && !matchesYearFilter(albDate, year)) continue;

        const key = `${albTitle.toLowerCase()}::${albArtist.toLowerCase()}`;
        if (seenAlbums.has(key)) continue;
        seenAlbums.add(key);
        albums.push({
          id: String(item.collectionId),
          source: 'itunes',
          title: albTitle,
          artist: albArtist,
          artworkUrl: upscaleArtwork(item.artworkUrl100, 600),
          releaseDate: albDate,
          genre: albGenre,
          trackCount: item.trackCount,
          externalUrl: item.collectionViewUrl,
        });
      }
    }

    res.json({ songs, albums });
  } catch (err) {
    res.status(502).json({
      error: 'Errore nella ricerca musicale.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

app.get('/api/music/album/:id', async (req, res) => {
  const { id } = req.params;
  const source = String(req.query.source || 'itunes');

  try {
    if (source === 'deezer') {
      const data = await fetchJsonWithTimeout(`https://api.deezer.com/album/${encodeURIComponent(id)}`);
      const tracks = (data?.tracks?.data ?? []).map((tr: any) => ({
        id: `deezer-${tr.id}`,
        source: 'deezer',
        title: tr.title_short || tr.title,
        artist: tr.artist?.name || data.artist?.name || 'Artista',
        album: data.title,
        albumId: String(data.id),
        artworkUrl: data.cover_big || data.cover_medium || '',
        previewUrl: tr.preview || undefined,
        releaseDate: data.release_date || new Date().toISOString().slice(0, 10),
        genre: data.genres?.data?.[0]?.name || 'Album',
        durationMs: (tr.duration || 180) * 1000,
        bpm: tr.bpm && tr.bpm > 0 ? Math.round(tr.bpm) : undefined,
        timeSignature: '4/4',
        bpmSource: tr.bpm && tr.bpm > 0 ? 'deezer' : undefined,
        externalUrl: tr.link,
      }));

      res.json({
        id: String(data.id),
        source: 'deezer',
        title: data.title,
        artist: data.artist?.name || 'Artista',
        artworkUrl: data.cover_big || data.cover_medium || '',
        releaseDate: data.release_date || new Date().toISOString().slice(0, 10),
        genre: data.genres?.data?.[0]?.name || 'Album',
        trackCount: data.nb_tracks || tracks.length,
        externalUrl: data.link,
        tracks,
      });
      return;
    }

    const data = await fetchJsonWithTimeout(
      `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=song&country=IT`
    );
    const results: any[] = data?.results ?? [];
    const albumMeta = results.find((r) => r.wrapperType === 'collection') || results[0];
    if (!albumMeta) {
      res.status(404).json({ error: 'Album non trovato.' });
      return;
    }

    const tracks = results
      .filter((r) => r.wrapperType === 'track')
      .map((item) => {
        const key = `${String(item.trackName).toLowerCase()}::${String(item.artistName).toLowerCase()}`;
        const cached = bpmCache.get(key);
        return {
          id: `itunes-${item.trackId}`,
          source: 'itunes',
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || albumMeta.collectionName,
          albumId: String(item.collectionId),
          artworkUrl: upscaleArtwork(item.artworkUrl100 || albumMeta.artworkUrl100, 600),
          previewUrl: item.previewUrl || undefined,
          releaseDate: parseItunesRssDate(item.releaseDate || albumMeta.releaseDate),
          genre: item.primaryGenreName || albumMeta.primaryGenreName || 'Musica',
          durationMs: item.trackTimeMillis || 180000,
          bpm: cached?.bpm,
          timeSignature: cached?.timeSignature || '4/4',
          musicalKey: cached?.musicalKey,
          bpmSource: cached?.bpmSource,
          externalUrl: item.trackViewUrl,
        };
      });

    res.json({
      id: String(albumMeta.collectionId),
      source: 'itunes',
      title: albumMeta.collectionName,
      artist: albumMeta.artistName,
      artworkUrl: upscaleArtwork(albumMeta.artworkUrl100, 600),
      releaseDate: parseItunesRssDate(albumMeta.releaseDate),
      genre: albumMeta.primaryGenreName || 'Album',
      trackCount: albumMeta.trackCount || tracks.length,
      externalUrl: albumMeta.collectionViewUrl,
      tracks,
    });
  } catch (err) {
    res.status(502).json({
      error: 'Errore nel caricamento della tracklist album.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

app.get('/api/music/bpm', async (req, res) => {
  const title = String(req.query.title || '').trim();
  const artist = String(req.query.artist || '').trim();
  const genre = String(req.query.genre || 'Pop').trim();

  if (!title) {
    res.status(400).json({ error: 'Titolo mancante.' });
    return;
  }

  const cacheKey = `${title.toLowerCase()}::${artist.toLowerCase()}`;
  const cached = bpmCache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  // 1. Try Deezer Track Detail for official BPM
  try {
    const query = encodeURIComponent(`${artist} ${title}`.trim());
    const searchData = await fetchJsonWithTimeout(`https://api.deezer.com/search/track?q=${query}&limit=3`, 4500);
    const firstMatch = searchData?.data?.[0];
    if (firstMatch?.id) {
      const trackDetail = await fetchJsonWithTimeout(`https://api.deezer.com/track/${firstMatch.id}`, 4500);
      if (trackDetail?.bpm && Number(trackDetail.bpm) > 25) {
        const result: CachedBpm = {
          bpm: Math.round(Number(trackDetail.bpm)),
          timeSignature: '4/4',
          musicalKey: '',
          bpmSource: 'deezer',
        };
        bpmCache.set(cacheKey, result);
        res.json(result);
        return;
      }
    }
  } catch {
    // Fall through to Gemini / genre estimate
  }

  // 2. Try fast Gemini 3.1 Flash Lite estimation if API key is configured
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Stima il BPM esatto, il metro (time signature, es. "4/4", "3/4", "6/8") e la tonalità musicale del brano "${title}" di "${artist}" (genere: ${genre}). Rispondi in JSON.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bpm: { type: Type.INTEGER, description: 'Tempo stimato in BPM tra 40 e 220' },
              timeSignature: { type: Type.STRING, description: 'Metro musicale es. 4/4, 3/4, 6/8' },
              musicalKey: { type: Type.STRING, description: 'Tonalità stimata es. La minore, Do maggiore' },
            },
            required: ['bpm', 'timeSignature', 'musicalKey'],
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      if (parsed.bpm && parsed.bpm >= 40 && parsed.bpm <= 240) {
        const result: CachedBpm = {
          bpm: Math.round(Number(parsed.bpm)),
          timeSignature: parsed.timeSignature || '4/4',
          musicalKey: parsed.musicalKey || '',
          bpmSource: 'gemini',
        };
        bpmCache.set(cacheKey, result);
        res.json(result);
        return;
      }
    } catch {
      // Fallback safely below
    }
  }

  const fallback: CachedBpm = {
    bpm: estimateGenreBpm(genre),
    timeSignature: '4/4',
    musicalKey: '',
    bpmSource: 'estimated',
  };
  bpmCache.set(cacheKey, fallback);
  res.json(fallback);
});

app.get('/api/music/lyrics', async (req, res) => {
  const title = String(req.query.title || '').trim();
  const artist = String(req.query.artist || '').trim();
  const album = String(req.query.album || '').trim();
  const durationSec = Number(req.query.duration || 0);

  if (!title || !artist) {
    res.status(400).json({ error: 'Titolo o artista mancante.' });
    return;
  }

  try {
    const params = new URLSearchParams({
      track_name: title,
      artist_name: artist,
    });
    if (album) params.set('album_name', album);
    if (durationSec > 10) params.set('duration', String(Math.round(durationSec)));

    let match: any = null;
    try {
      match = await fetchJsonWithTimeout(`https://lrclib.net/api/get?${params.toString()}`, 5000);
    } catch {
      const searchParams = new URLSearchParams({ q: `${artist} ${title}` });
      const list = await fetchJsonWithTimeout(`https://lrclib.net/api/search?${searchParams.toString()}`, 5000);
      if (Array.isArray(list) && list.length > 0) {
        match = list.find((item: any) => item.syncedLyrics) || list[0];
      }
    }

    if (!match) {
      res.status(404).json({ error: 'Testo non trovato su LRCLIB.' });
      return;
    }

    res.json({
      id: match.id,
      trackName: match.trackName || title,
      artistName: match.artistName || artist,
      syncedLyrics: match.syncedLyrics || null,
      plainLyrics: match.plainLyrics || null,
      instrumental: Boolean(match.instrumental),
      provider: 'LRCLIB',
    });
  } catch (err) {
    res.status(502).json({
      error: 'Impossibile recuperare i testi da LRCLIB.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

interface JamRoomRecord {
  code: string;
  hostName: string;
  song: any | null;
  isPlaying: boolean;
  positionSec: number;
  bpm: number;
  queue: any[];
  listeners: Map<string, number>;
  updatedAt: number;
}

const jamRooms = new Map<string, JamRoomRecord>();

function serializeJamRoom(room: JamRoomRecord) {
  const cutoff = Date.now() - 45000;
  for (const [cid, ts] of room.listeners.entries()) {
    if (ts < cutoff) room.listeners.delete(cid);
  }
  return {
    code: room.code,
    hostName: room.hostName,
    song: room.song,
    isPlaying: room.isPlaying,
    positionSec: room.positionSec,
    bpm: room.bpm,
    queue: room.queue,
    listenerCount: Math.max(1, room.listeners.size),
    updatedAt: room.updatedAt,
  };
}

app.post('/api/jam', (req, res) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  const code = `LW-${suffix}`;
  const clientId = String(req.body?.clientId || `host-${Date.now()}`);
  const listeners = new Map<string, number>();
  listeners.set(clientId, Date.now());

  const room: JamRoomRecord = {
    code,
    hostName: String(req.body?.hostName || 'LastWave Host').slice(0, 40),
    song: req.body?.song || null,
    isPlaying: Boolean(req.body?.isPlaying),
    positionSec: Number(req.body?.positionSec || 0),
    bpm: Number(req.body?.bpm || 120),
    queue: Array.isArray(req.body?.queue) ? req.body.queue.slice(0, 30) : [],
    listeners,
    updatedAt: Date.now(),
  };

  jamRooms.set(code, room);
  res.json(serializeJamRoom(room));
});

app.get('/api/jam/:code', (req, res) => {
  const code = String(req.params.code || '').toUpperCase().trim();
  const room = jamRooms.get(code);
  if (!room) {
    res.status(404).json({ error: 'Jam Room non trovata o scaduta.' });
    return;
  }
  const clientId = String(req.query.clientId || '');
  if (clientId) {
    room.listeners.set(clientId, Date.now());
  }
  res.json(serializeJamRoom(room));
});

app.post('/api/jam/:code/sync', (req, res) => {
  const code = String(req.params.code || '').toUpperCase().trim();
  const room = jamRooms.get(code);
  if (!room) {
    res.status(404).json({ error: 'Jam Room non trovata o scaduta.' });
    return;
  }
  const clientId = String(req.body?.clientId || '');
  if (clientId) {
    room.listeners.set(clientId, Date.now());
  }
  if (req.body?.song !== undefined) room.song = req.body.song;
  if (req.body?.isPlaying !== undefined) room.isPlaying = Boolean(req.body.isPlaying);
  if (typeof req.body?.positionSec === 'number') room.positionSec = req.body.positionSec;
  if (typeof req.body?.bpm === 'number') room.bpm = req.body.bpm;
  if (Array.isArray(req.body?.queue)) room.queue = req.body.queue.slice(0, 30);
  room.updatedAt = Date.now();
  res.json(serializeJamRoom(room));
});

app.post('/api/music/lyrics-translate', async (req, res) => {
  const lines = Array.isArray(req.body?.lines)
    ? req.body.lines.map((l: any) => String(l)).slice(0, 60)
    : [];
  const mode = req.body?.mode === 'romanize' ? 'romanize' : 'translate';
  const targetLang = String(req.body?.targetLang || 'it');
  const langName = LANGUAGE_NAMES[targetLang] || 'Italian';

  if (lines.length === 0) {
    res.status(400).json({ error: 'Nessun verso fornito.' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(403).json({
      error: 'Configura una chiave API Gemini in Settings > Secrets per tradurre o romanizzare i testi live.',
    });
    return;
  }

  try {
    const prompt =
      mode === 'romanize'
        ? `Romanize (phonetic Latin transliteration only; if already in Latin script, keep concise phonetic pronunciation) each of the following ${lines.length} lyric lines. Return JSON with a "lines" array of the exact same length (${lines.length}). Lines:\n${lines
            .map((l, i) => `${i + 1}. ${l}`)
            .join('\n')}`
        : `Translate naturally into ${langName} each of the following ${lines.length} song lyric lines while preserving poetic rhythm. Return JSON with a "lines" array of the exact same length (${lines.length}). Lines:\n${lines
            .map((l, i) => `${i + 1}. ${l}`)
            .join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['lines'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    const outLines = Array.isArray(parsed.lines) ? parsed.lines : [];
    res.json({ mode, lines: outLines });
  } catch (err) {
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

const audioProxyCache = new Map<string, { contentType: string; data: Buffer }>();
const MAX_AUDIO_PROXY_CACHE = 24;

app.get('/api/audio-proxy', async (req, res) => {
  const rawUrl = String(req.query.url || '');
  if (!rawUrl) {
    res.status(400).send('Missing url');
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    res.status(400).send('Invalid url');
    return;
  }

  const allowedHosts = ['mzstatic.com', 'apple.com', 'dzcdn.net', 'deezer.com'];
  const isAllowed = allowedHosts.some((h) => parsed.hostname.endsWith(h));
  if (!isAllowed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
    res.status(403).send('Host not permitted');
    return;
  }

  const cacheKey = parsed.toString();
  const cached = audioProxyCache.get(cacheKey);
  if (cached) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(cached.data);
    return;
  }

  try {
    const upstream = await fetch(cacheKey);
    if (!upstream.ok) {
      res.status(upstream.status).send('Upstream audio error');
      return;
    }
    const contentType = upstream.headers.get('content-type') || 'audio/mp4';
    const buffer = Buffer.from(await upstream.arrayBuffer());

    if (audioProxyCache.size >= MAX_AUDIO_PROXY_CACHE) {
      const oldestKey = audioProxyCache.keys().next().value;
      if (oldestKey) audioProxyCache.delete(oldestKey);
    }
    audioProxyCache.set(cacheKey, { contentType, data: buffer });

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(buffer);
  } catch (err) {
    res.status(502).send(err instanceof Error ? err.message : 'Audio proxy failure');
  }
});

const LANGUAGE_NAMES: Record<string, string> = {
  it: 'Italian (italiano)',
  en: 'English',
  es: 'Spanish (español)',
  fr: 'French (français)',
  de: 'German (Deutsch)',
};

app.post('/api/music/discover-latest', async (req, res) => {
  const focus = String(req.body?.focus || 'Italia e Internazionale').trim();
  const langCode = String(req.body?.language || 'it');
  const langName = LANGUAGE_NAMES[langCode] || 'Italian';
  const ai = getGeminiClient();
  if (!ai) {
    res.status(403).json({
      error: 'Chiave API Gemini non configurata in Settings > Secrets. Puoi comunque aggiornare le classifiche e le nuove uscite live dal feed iTunes e Deezer.',
    });
    return;
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Today is ${today}. Search the web for the very latest real music releases (new albums and new singles released in recent days or this week) with focus on: ${focus}. List 6 real recent releases specifying Title, Artist, Type (Album or Single), Release Date, and a brief sonic/rhythmic description in ${langName}.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w?.uri)
      .map((w: any) => ({ title: w.title || w.uri, uri: w.uri }));

    res.json({
      summary: response.text || '',
      sources,
      discoveredAt: new Date().toISOString(),
    });
  } catch (err) {
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

app.post('/api/studio/cover', async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();
  const imageSize = String(req.body?.imageSize || '1K');
  const aspectRatio = String(req.body?.aspectRatio || '1:1');

  if (!prompt) {
    res.status(400).json({ error: 'Inserisci una descrizione per generare la copertina.' });
    return;
  }

  const validSizes = new Set(['1K', '2K', '4K']);
  const validRatios = new Set(['1:1', '16:9', '3:4', '9:16', '4:3']);
  const safeSize = validSizes.has(imageSize) ? imageSize : '1K';
  const safeRatio = validRatios.has(aspectRatio) ? aspectRatio : '1:1';

  const ai = getGeminiClient();
  if (!ai) {
    res.status(403).json({
      error: 'Chiave API Gemini non configurata. Configura una chiave abilitata in Settings > Secrets per generare copertine con gemini-3-pro-image-preview.',
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `High-craft contemporary music album cover artwork. ${prompt}. Studio-grade visual composition, rich textures, cohesive lighting, no watermarks.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: safeRatio,
          imageSize: safeSize,
        },
      },
    });

    let imageUrl = '';
    let note = '';
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType ?? 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        note += part.text;
      }
    }

    if (!imageUrl) {
      res.status(502).json({
        error: 'Il modello non ha restituito un immagine valida. Riprova modificando il prompt.',
        note,
      });
      return;
    }

    res.json({
      imageUrl,
      note,
      size: safeSize,
      aspectRatio: safeRatio,
      model: 'gemini-3-pro-image-preview',
    });
  } catch (err) {
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

const ROLE_INSTRUCTIONS: Record<string, string> = {
  'gemini-4-carbon':
    'Sei il Direttore Musicale e Teorico di RitmoStudio. Rispondi in italiano con analisi profonde di armonia, poliritmia, tempi composti, arrangiamento e struttura delle canzoni. Sii rigoroso, pratico per musicisti e chiaro.',
  'gemini-4-argon':
    'Sei il Produttore e Sound Designer interattivo di RitmoStudio. Rispondi in italiano aiutando l utente a progettare transizioni DJ, remix, catene di missaggio, sidechain sincronizzato al BPM e scalette live.',
  'gemini-4-hydrogen':
    'Sei il Curatore Musicale delle Nuove Uscite di RitmoStudio. Rispondi in italiano consigliando nuovi album, singoli recenti, artisti emergenti e collegamenti tra brani con attenzione a stile e BPM.',
  'gemini-3.1-flash-lite':
    'Sei l Assistente Rapido Ritmo di RitmoStudio. Rispondi in italiano in modo sintetico e immediato con valori di BPM, esercizi pratici sul metronomo, suddivisioni e consigli veloci per suonare a tempo.',
};

app.post('/api/chat', async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const requestedModel = String(req.body?.model || 'gemini-4-hydrogen');
  const currentSong = req.body?.currentSong;
  const useSearch = Boolean(req.body?.useSearch);
  const langCode = String(req.body?.language || 'it');
  const langName = LANGUAGE_NAMES[langCode] || 'Italian';

  const allowedModels = new Set([
    'gemini-4-carbon',
    'gemini-4-argon',
    'gemini-4-hydrogen',
    'gemini-3.1-flash-lite',
  ]);
  const model = allowedModels.has(requestedModel) ? requestedModel : 'gemini-4-hydrogen';

  const latestUserMsg = [...messages].reverse().find((m: any) => m.role === 'user' && m.text);
  if (!latestUserMsg) {
    res.status(400).json({ error: 'Nessun messaggio utente fornito.' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(403).json({
      error: 'Chiave API Gemini non configurata. Configura la chiave in Settings > Secrets per attivare la chat multi-turno.',
    });
    return;
  }

  try {
    let systemInstruction = `${ROLE_INSTRUCTIONS[model] || ROLE_INSTRUCTIONS['gemini-4-hydrogen']} Always reply in ${langName}.`;
    if (currentSong?.title) {
      systemInstruction += `\n\nActive track currently loaded and synced to the metronome:\n- Title: ${currentSong.title}\n- Artist: ${currentSong.artist}\n- Album: ${currentSong.album || 'N/A'}\n- Genre: ${currentSong.genre || 'N/A'}\n- Active BPM: ${currentSong.bpm || 'N/A'} BPM (${currentSong.timeSignature || '4/4'})`;
    }

    const priorMessages = messages.slice(0, -1);
    const history: Content[] = priorMessages
      .filter((m: any) => (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && !m.error)
      .map((m: any) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

    const config: Record<string, any> = {
      systemInstruction,
    };
    if (useSearch && model === 'gemini-4-hydrogen') {
      config.tools = [{ googleSearch: {} }];
    }

    const chat = ai.chats.create({
      model,
      history,
      config,
    });

    const response = await chat.sendMessage({ message: String(latestUserMsg.text) });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w?.uri)
      .map((w: any) => ({ title: w.title || w.uri, uri: w.uri }));

    res.json({
      reply: response.text || 'Nessuna risposta generata.',
      model,
      sources,
    });
  } catch (err) {
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RitmoStudio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
