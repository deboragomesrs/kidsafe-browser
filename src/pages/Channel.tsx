import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YouTubeVideo, ChannelDetails } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";
import VideoGrid from "@/components/VideoGrid";
import VideoPlayer from "@/components/VideoPlayer";
import ChannelHeader from "@/components/ChannelHeader";
import { useState } from "react";

const fetchChannelDetails = async (channelId: string): Promise<ChannelDetails> => {
  const { data, error } = await supabase.functions.invoke("fetch-youtube-channel-videos", {
    body: { channelId },
  });

  if (error) throw new Error(error.message || "Falha ao buscar detalhes do canal.");
  if (!data) throw new Error("Resposta inválida do servidor.");
  return data;
};

export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null);

  const { data, isLoading, error } = useQuery<ChannelDetails, Error>({
    queryKey: ["channel", channelId],
    queryFn: () => fetchChannelDetails(channelId!),
    enabled: !!channelId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erro ao Carregar Canal</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  const regularVideos = data.videos.filter(v => !v.title.toLowerCase().includes("#shorts"));
  const shorts = data.videos.filter(v => v.title.toLowerCase().includes("#shorts"));

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <ChannelHeader 
          channelName={data.channelName}
          channelThumbnail={data.channelThumbnail}
          channelBannerUrl={data.channelBannerUrl}
          videoCount={data.videos.length}
        />
        
        <div className="p-4 md:p-6">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="videos" className="text-base font-bold">Vídeos</TabsTrigger>
              <TabsTrigger value="shorts" className="text-base font-bold">Shorts</TabsTrigger>
              <TabsTrigger value="live" className="text-base font-bold" disabled>Ao Vivo</TabsTrigger>
            </TabsList>
            <TabsContent value="videos" className="mt-6">
              <VideoGrid videos={regularVideos} onVideoSelect={setPlayingVideo} />
            </TabsContent>
            <TabsContent value="shorts" className="mt-6">
              <VideoGrid videos={shorts} onVideoSelect={setPlayingVideo} />
            </TabsContent>
             <TabsContent value="live" className="mt-6">
              <p className="text-muted-foreground text-center py-8">Conteúdo ao vivo não está disponível no momento.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />
    </>
  );
}