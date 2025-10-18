import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, Tv } from "lucide-react";
import { AllowedContent, YouTubeVideo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import VideoGrid from "./VideoGrid";
import TopChannelsCarousel from "./TopChannelsCarousel"; // Importando o novo componente
import { useAuth } from "@/context/AuthContext";

const fetchAllowedContent = async (userId: string): Promise<AllowedContent[]> => {
  const { data, error } = await supabase
    .from('allowed_content')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'channel');

  if (error) throw new Error(error.message);
  return data || [];
};

const fetchLatestVideoForChannel = async (channelContentId: string): Promise<YouTubeVideo | null> => {
  const { data, error } = await supabase.functions.invoke("fetch-youtube-channel-videos", {
    body: { channelId: channelContentId },
  });
  if (error || !data.videos || data.videos.length === 0) return null;
  const latestVideo = data.videos[0];
  latestVideo.channelId = channelContentId;
  return latestVideo;
};

export default function HomeView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: allowedChannels = [], isLoading: isLoadingChannels } = useQuery({
    queryKey: ['allowedContent', user?.id],
    queryFn: () => fetchAllowedContent(user!.id),
    enabled: !!user,
  });

  const { data: latestVideos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['latestVideos', allowedChannels.map(c => c.content_id)],
    queryFn: async () => {
      const videoPromises = allowedChannels
        .map(c => c.content_id)
        .filter((id): id is string => !!id)
        .map(fetchLatestVideoForChannel);
      const videos = await Promise.all(videoPromises);
      return videos.filter((v): v is YouTubeVideo => v !== null);
    },
    enabled: allowedChannels.length > 0,
  });

  const handleVideoClick = (video: YouTubeVideo) => {
    if (video.channelId) {
      navigate(`/channel/${video.channelId}`);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="card-kids max-w-2xl">
          <Tv className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-foreground">Bem-vindo ao Barra Kids!</h2>
          <p className="text-muted-foreground mb-6">
            Faça login para configurar os canais favoritos dos seus filhos e começar a diversão!
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingChannels) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  if (allowedChannels.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="card-kids max-w-2xl">
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
    <div className="flex-1 flex flex-col">
      {/* Substituindo ChannelNav pelo novo carrossel */}
      <TopChannelsCarousel channels={allowedChannels} />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4">Últimos Vídeos</h2>
        {isLoadingVideos ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
        ) : (
          <VideoGrid videos={latestVideos || []} onVideoSelect={handleVideoClick} />
        )}
      </div>
    </div>
  );
}