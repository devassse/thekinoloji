"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import Img from "@/components/Img";
import type { Video } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const thumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export default function VideoSection({ videos }: { videos: Video[] }) {
  const [current, setCurrent] = useState(videos[0]?.id);
  const [playing, setPlaying] = useState(false);
  const main = videos.find((v) => v.id === current) ?? videos[0];
  if (!main) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div className="relative">
      {/* on desktop the list is as tall as the player and scrolls (overflow-y: auto) */}
      <ul tabIndex={0} aria-label="Playlist" className="panel max-h-[26rem] space-y-1 overflow-y-auto overscroll-contain p-2 [scrollbar-width:thin] lg:absolute lg:inset-0 lg:max-h-none">
        {videos.map((v) => {
          const on = v.id === main.id;
          return (
            <li key={v.id}>
              <button type="button" onClick={() => { setCurrent(v.id); setPlaying(true); }} aria-current={on}
                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${on ? "bg-brand/10 ring-1 ring-brand/40" : "hover:bg-surface2"}`}>
                <span className="relative h-16 w-28 flex-none overflow-hidden rounded-md bg-navy-800">
                  <Img src={thumb(v.youtubeId)} alt="" className="h-full w-full object-cover" />
                  {v.duration && <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 text-[10px] font-semibold text-white">{v.duration}</span>}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink">{v.title}</span>
                  <span suppressHydrationWarning className="mt-1 block text-[11px] text-muted">{timeAgo(v.createdAt)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {playing ? (
          <iframe key={main.id} className="absolute inset-0 h-full w-full" title={main.title}
            src={`https://www.youtube-nocookie.com/embed/${main.youtubeId}?autoplay=1&rel=0`}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={`Reproduzir: ${main.title}`} className="group absolute inset-0 text-left">
            <Img src={thumb(main.youtubeId)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-900 shadow-xl transition-transform group-hover:scale-110"><Play size={28} className="ml-1" fill="currentColor" /></span>
            <span className="absolute inset-x-0 bottom-0 p-5">
              <span className="block font-display text-xl font-bold leading-tight text-white md:text-2xl">{main.title}</span>
              <span suppressHydrationWarning className="mt-1 block text-xs text-white/75">{timeAgo(main.createdAt)}{main.duration && ` · ${main.duration}`}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
