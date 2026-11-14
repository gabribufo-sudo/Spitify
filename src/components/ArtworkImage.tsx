import { useState } from 'react';
import { Disc3 } from 'lucide-react';

interface ArtworkImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ArtworkImage({ src, alt, className = '', fallbackLabel }: ArtworkImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#161912] via-[#20251E] to-[#0E100C] text-[#EEF1E6]/75 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Disc3 className="w-8 h-8 opacity-75 mb-1.5 text-[#C6F100]/80" />
        {fallbackLabel ? (
          <span className="px-2 text-[11px] font-medium text-[#B8BFAE] text-center line-clamp-2">
            {fallbackLabel}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
