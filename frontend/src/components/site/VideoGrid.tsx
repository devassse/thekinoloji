"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import Img from "@/components/Img";
import type { Video } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function VideoGrid({ videos }: { videos: Video[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v) => (
        <li key={v.id} className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="relative aspect-video bg-black">
            {playing === v.id ? (
              <iframe className="absolute inset-0 h-full w-full" title={v.title} allowFullScreen
                src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture" />
            ) : (
              <button type="button" onClick={() => setPlaying(v.id)} aria-label={`Reproduzir: ${v.title}`} className="group absolute inset-0">
                <Img src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
                <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-900 shadow-lg transition-transform group-hover:scale-110"><Play size={22} className="ml-0.5" fill="currentColor" /></span>
                {v.duration && <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">{v.duration}</span>}
              </button>
            )}
          </div>
          <div className="space-y-1 p-3">
            <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{v.title}</h2>
            <p suppressHydrationWarning className="text-[11px] text-muted">{timeAgo(v.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
