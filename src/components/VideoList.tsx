import { Link } from "react-router-dom";
import { YouTubeVideo } from "@/types";

interface Props {
  videos: YouTubeVideo[];
  currentVideoId?: string;
}

export default function VideoList({ videos, currentVideoId }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {videos.map((video) => (
        video.id !== currentVideoId && (
          <Link to={`/watch/${video.id}`} key={video.id} className="flex gap-3 group">
            <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary">
                {video.title}
              </h3>
            </div>
          </Link>
        )
      ))}
    </div>
  );
}