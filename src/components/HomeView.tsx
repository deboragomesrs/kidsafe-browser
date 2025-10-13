import { useState, useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { AllowedContent, YouTubeVideo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import VideoGrid from "./VideoGrid";
import ChannelNav from "./ChannelNav";

type LatestVideoResult = {
  channel: AllowedContent;
  video: YouTubeVideo | null;
};

const fetchLatestVideo = async (channel: AllowedContent): Promise<LatestVideoResult> => {
  if (channel.type !== 'channel') return { channel, video: null };
  
  const { data, error } = await supabase.functions.invoke("fetch-youtube-channel-videos", {
    body: { channelId: channel.id },
  });

  if (error) {
    console.error(`Failed to fetch videos for channel ${channel.name}:`, error);
    return { channel, video: null };
  }

  const latestVideo = data.videos?.[0] || null;
  if (latestVideo) {
    latestVideo.channelId = channel.id; // Anexando o ID do canal ao vídeo
  }

  return { channel, video: latestVideo };
};

export default function HomeView() {
  const [allowedContent, setAllowedContent] = useState<AllowedContent[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("barraKidsAllowedContent");
    if (saved) {
      try {
        setAllowedContent(JSON.parse(saved));
      } catch {
        setAllowedContent([]);
      }
    }
  }, []);

  const channelQueries = useQueries({
    queries: allowedContent
      .filter(c => c.type === 'channel')
      .map(channel => ({
        queryKey: ['latestVideo', channel.type === 'channel' ? channel.id : ''],
        queryFn: () => fetchLatestVideo(channel),
      })),
  });

  const isLoading = channelQueries.some(q => q.isLoading);
  const latestVideos = channelQueries
    .map(q => q.data?.video)
    .filter((v): v is YouTubeVideo => v !== null && v !== undefined);

  const handleVideoClick = (video: YouTubeVideo) => {
    if (video.channelId) {
      navigate(`/channel/${video.channelId}`);
    }
  };

  if (allowedContent.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="card-kids max-w-2xl text-center">
          <AlertCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-foreground">Nenhum conteúdo disponível</h2>
          <p className="text-muted-foreground mb-6">
            Peça aos seus pais para adicionar alguns canais no Painel dos Pais!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChannelNav channels={allowedContent} onChannelSelect={() => {}} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4">Últimos Vídeos</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <VideoGrid videos={latestVideos} onVideoSelect={handleVideoClick} />
        )}
      </div>
    </div>
  );
}