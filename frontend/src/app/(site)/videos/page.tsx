import { api } from "@/lib/api";
import Newsletter from "@/components/site/Newsletter";
import VideoGrid from "@/components/site/VideoGrid";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vídeos" };

export default async function VideosPage() {
  const [{ settings }, videos] = await Promise.all([api.site(), api.videos(100)]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Vídeos da Playlist</h1>
        <p className="mt-1 text-sm text-muted">{videos.length} {videos.length === 1 ? "vídeo" : "vídeos"}</p>
      </header>
      {videos.length ? <VideoGrid videos={videos} /> : <p className="py-16 text-center text-muted">Ainda não há vídeos publicados.</p>}
      <div className="mx-auto max-w-xl pt-6"><Newsletter title={settings.newsletterTitle} text={settings.newsletterText} /></div>
    </div>
  );
}
