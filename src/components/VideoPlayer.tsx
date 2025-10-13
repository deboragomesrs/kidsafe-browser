import { Dialog, DialogContent } from "@/components/ui/dialog";
import { YouTubeVideo } from "@/types";

interface Props {
  video: YouTubeVideo | null;
  onClose: () => void;
}

export default function VideoPlayer({ video, onClose }: Props) {
  if (!video) return null;

  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1`;

  return (
    <Dialog open={!!video} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black border-0">
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}