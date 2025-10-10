import { useState, useEffect } from "react";
import { AlertCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SafeBrowser() {
  const [allowedUrls, setAllowedUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("barraKidsAllowedUrls");
    if (saved) {
      try {
        const urls = JSON.parse(saved);
        setAllowedUrls(urls);
        if (urls.length > 0) {
          setCurrentUrl(convertToEmbedUrl(urls[0]));
        }
      } catch {
        setAllowedUrls([]);
      }
    }
  }, []);

  const convertToEmbedUrl = (url: string): string => {
    // Convert regular YouTube URLs to embed format
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    
    // If already embed URL or playlist
    if (url.includes("youtube.com/embed/") || url.includes("youtube.com/playlist")) {
      return url;
    }
    
    return url;
  };

  const loadVideo = (url: string) => {
    setError("");
    setCurrentUrl(convertToEmbedUrl(url));
  };

  if (allowedUrls.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="card-kids max-w-2xl text-center">
          <AlertCircle className="w-16 h-16 text-[hsl(var(--youtube-red))] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-foreground">Nenhum vídeo disponível</h2>
          <p className="text-muted-foreground mb-6">
            Peça aos seus pais para adicionar alguns vídeos ou canais no Painel dos Pais!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Video List */}
      <div className="bg-card border-b border-border p-4 overflow-x-auto"> {/* Usando bg-card e border-border */}
        <div className="flex gap-3 min-w-max">
          {allowedUrls.map((url, index) => (
            <Button
              key={index}
              onClick={() => loadVideo(url)}
              variant={currentUrl === convertToEmbedUrl(url) ? "default" : "outline"}
              className="btn-kids shrink-0"
            >
              <Play className="w-4 h-4 mr-2" />
              Vídeo {index + 1}
            </Button>
          ))}
        </div>
      </div>

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
        {currentUrl && (
          <iframe
            src={currentUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
          />
        )}
      </div>
    </div>
  );
}