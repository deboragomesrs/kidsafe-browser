interface Props {
  videoId: string;
}

export default function EmbeddedVideoPlayer({ videoId }: Props) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  return (
    <div className="aspect-video w-full">
      <iframe
        src={embedUrl}
        className="h-full w-full rounded-xl border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video player"
      />
    </div>
  );
}