import React, { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function SafeImage({ src, alt, className = 'h-full w-full object-contain rounded-lg', fallbackIcon }: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const shouldBlockSource = (() => {
    if (!src) return true;
    try {
      const parsed = new URL(src.startsWith("http") ? src : `https://${src}`);
      return parsed.hostname.includes("clearbit.com");
    } catch {
      return true;
    }
  })();

  if (error || shouldBlockSource) {
    return (
      <div className={className + ' bg-slate-100 flex items-center justify-center border text-slate-400 font-black'}>
        {fallbackIcon || <span className="text-xs">{initials}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${loaded ? '' : 'animate-pulse bg-muted'}`}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );
}
