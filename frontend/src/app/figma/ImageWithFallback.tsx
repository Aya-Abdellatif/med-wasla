interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  if (!src) {
    return (
      <div
        className={`bg-slate-200 flex items-center justify-center text-slate-500 text-sm ${className ?? ""}`}
        aria-label={alt}
      />
    );
  }

  return <img src={src} alt={alt} className={className} />;
}
