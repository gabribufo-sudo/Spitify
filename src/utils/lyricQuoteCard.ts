import type { ArtworkPalette, SongItem } from '../types/music';

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function exportLyricQuoteCardPng(
  song: SongItem,
  quoteLines: string[],
  palette: ArtworkPalette
): Promise<void> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background deep obsidian + dynamic Monet glow
  ctx.fillStyle = '#0E100C';
  ctx.fillRect(0, 0, width, height);

  const g1 = ctx.createRadialGradient(220, 260, 40, 220, 260, 720);
  g1.addColorStop(0, `${palette.primary}66`);
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, width, height);

  const g2 = ctx.createRadialGradient(880, 1080, 30, 880, 1080, 660);
  g2.addColorStop(0, `${palette.secondary}88`);
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, width, height);

  // Liquid glass card container
  const pad = 76;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, cardH, 52);
  ctx.fillStyle = 'rgba(20, 24, 18, 0.78)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.stroke();
  ctx.restore();

  // Header album artwork + title
  const artX = pad + 56;
  const artY = pad + 56;
  const artSize = 148;

  if (song.artworkUrl) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = song.artworkUrl;
      });
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(artX, artY, artSize, artSize, 26);
      ctx.clip();
      ctx.drawImage(img, artX, artY, artSize, artSize);
      ctx.restore();
    } catch {
      ctx.fillStyle = '#1E241A';
      ctx.beginPath();
      ctx.roundRect(artX, artY, artSize, artSize, 26);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#EEF1E6';
  ctx.font = '700 38px system-ui, -apple-system, sans-serif';
  ctx.fillText(song.title.slice(0, 28), artX + artSize + 36, artY + 62);

  ctx.fillStyle = '#B8BFAE';
  ctx.font = '500 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(song.artist.slice(0, 32), artX + artSize + 36, artY + 108);

  ctx.fillStyle = palette.primary || '#C6F100';
  ctx.font = '700 20px monospace';
  ctx.fillText('LASTWAVE LIQUID QUOTE · 24-BIT / 192 KHZ', artX + artSize + 36, artY + 146);

  // Quoted lyrics centered in middle
  const cleaned = quoteLines
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4);
  const textX = pad + 64;
  const maxTextW = cardW - 128;
  let y = artY + artSize + 150;

  ctx.fillStyle = palette.primary || '#C6F100';
  ctx.font = '700 72px Georgia, serif';
  ctx.fillText('“', textX, y - 34);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 48px system-ui, -apple-system, sans-serif';

  for (const rawLine of cleaned) {
    const wrapped = wrapLines(ctx, rawLine, maxTextW);
    for (const wLine of wrapped) {
      if (y > height - pad - 140) break;
      ctx.fillText(wLine, textX, y);
      y += 66;
    }
    y += 22;
  }

  // Footer signature
  ctx.fillStyle = '#9BA392';
  ctx.font = '600 22px monospace';
  ctx.fillText(`ritmostudio · ${song.album || 'Lossless Edition'}`, pad + 56, height - pad - 56);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${song.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-quote.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
