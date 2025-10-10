import { useState, useEffect } from "react";
import { AlertCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AllowedContent, YouTubeVideo } from "@/types"; // Importa os tipos

const SUPABASE_EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-youtube-channel-videos`;

export default function SafeBrowser() {
  const [allowedContent, setAllowedContent] = useState<AllowedContent[]>([]);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState("");
  const [currentVideos, setCurrentVideos] = useState<YouTubeVideo[]>([]);
  const [selectedContentIndex, setSelectedContentIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("barraKidsAllowedContent");
    if (saved) {
      try {
        const content = JSON.parse(saved);
        setAllowedContent(content);
        if (content.length > 0) {
          // Automatically load the first item
          loadContent(content[0], 0);
        }
      } catch {
        setAllowedContent([]);
      }
    }
  }, []);

  const convertToEmbedUrl = (url: string): string => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url; // Return as is if already embed or not a standard video URL
  };

  const loadContent = async (content: AllowedContent, index: number) => {
    setError("");
    setSelectedContentIndex(index);
    setCurrentVideos([]); // Clear previous videos

    if (content.type === 'video') {
      setCurrentEmbedUrl(convertToEmbedUrl(content.url));
    } else if (content.type === 'channel') {
      toast.loading(`Carregando vídeos do canal "${content.name}"...`);
      try {
        const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId: content.id }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Falha ao buscar vídeos do canal.");
        }
        
        setCurrentVideos(data.videos);
        if (data.videos.length > 0) {
          setCurrentEmbedUrl(convertToEmbedUrl(data.videos[0].url));
        } else {
          setCurrentEmbedUrl("");
          setError("Nenhum vídeo encontrado neste canal.");
        }
        toast.dismiss();
        toast.success(`Vídeos do canal "${content.name}" carregados!`);

      } catch (err: any) {
        toast.dismiss();
        setError(`Erro ao carregar vídeos do canal: ${err.message}`);
        setCurrentEmbedUrl("");
      }
    }
  };

  if (allowedContent.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="card-kids max-w-2xl text-center">
          <AlertCircle className="w-16 h-16 text-[hsl(var(--youtube-red))] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-foreground">Nenhum conteúdo disponível</h2>
          <p className="text-muted-foreground mb-6">
            Peça aos seus pais para adicionar alguns vídeos ou canais no Painel dos Pais!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Content List (Videos/Channels) */}
      <div className="bg-card border-b border-border p-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {allowedContent.map((content, index) => (
            <Button
              key={index}
              onClick={() => loadContent(content, index)}
              variant={selectedContentIndex === index ? "default" : "outline"}
              className="btn-kids shrink-0"
            >
              {content.type === 'video' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Vídeo {index + 1}
                </>
              ) : (
                <>
                  <img src={content.thumbnail || 'https://via.placeholder.com/20x20?text=C'} alt={content.name} className="w-5 h-5 rounded-full mr-2" />
                  {content.name}
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Videos from selected channel (if applicable) */}
      {selectedContentIndex !== null && allowedContent[selectedContentIndex]?.type === 'channel' && currentVideos.length > 0 && (
        <div className="bg-card border-b border-border p-4 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            {currentVideos.map((video, videoIndex) => (
              <Button
                key={video.id}
                onClick={() => setCurrentEmbedUrl(convertToEmbedUrl(video.url))}
                variant={currentEmbedUrl === convertToEmbedUrl(video.url) ? "default" : "outline"}
                className="btn-kids shrink-0"
              >
                <img src={video.thumbnail} alt={video.title} className="w-8 h-8 object-cover rounded-md mr-2" />
                {video.title.length > 20 ? `${video.title.substring(0, 20)}...` : video.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Video Player */}
      <div className="flex-1 bg-black relative">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p>{error}</p>
            </div>
          </div>
        )}
        {currentEmbedUrl ? (
          <iframe
            src={currentEmbedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-8">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-4 text-white" />
              <p>Selecione um vídeo para começar a assistir!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}