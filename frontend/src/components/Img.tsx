"use client";

const FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23071230'/><stop offset='1' stop-color='%231e6bff'/></linearGradient></defs><rect width='800' height='500' fill='url(%23g)'/></svg>";

export default function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || FALLBACK}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
    />
  );
}
