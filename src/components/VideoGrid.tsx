import { YouTubeVideo } from "@/types";
import { PlayCircle } from "lucide-react";

interface Props {
  videos: YouTubeVideo[];
  onVideoSelect?: (video: YouTubeVideo) => void;
}

export default function VideoGrid({ videos, onVideoSelect }: Props) {
  if (videos.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum vídeo encontrado.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="group cursor-pointer"
          onClick={() => onVideoSelect && onVideoSelect(video)}
        >
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h3 className="font-semibold mt-2 text-sm leading-tight truncate">{video.title}</h3>
        </div>
      ))}
    </div>
  );
}