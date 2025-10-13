import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YouTubeVideo, AllowedContent } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";
import VideoGrid from "@/components/VideoGrid";

type ChannelDetails = {
  channelId: string;
  channelName: string;
  channelBannerUrl?: string;
  videos: YouTubeVideo[];
};

const fetchChannelDetails = async (channelId: string): Promise<ChannelDetails> => {
  const { data, error } = await supabase.functions.invoke("fetch-youtube-channel-videos", {
    body: { channelId },
  });

  if (error) {
    throw new Error(error.message || "Falha ao buscar detalhes do canal.");
  }
  if (!data) {
    throw new Error("Resposta inválida do servidor.");
  }
  return data;
};

export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [channelInfo, setChannelInfo] = useState<AllowedContent | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("barraKidsAllowedContent");
    if (saved && channelId) {
      try {
        const content: AllowedContent[] = JSON.parse(saved);
        const info = content.find(c => c.type === 'channel' && c.id === channelId);
        setChannelInfo(info || null);
      } catch {
        setChannelInfo(null);
      }
    }
  }, [channelId]);

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

  if (!data) {
    return null;
  }

  const regularVideos = data.videos.filter(v => !v.title.toLowerCase().includes("#shorts"));
  const shorts = data.videos.filter(v => v.title.toLowerCase().includes("#shorts"));

  return (
    <div className="w-full h-full flex flex-col">
      {data.channelBannerUrl && (
        <div className="w-full h-32 md:h-48">
          <img src={data.channelBannerUrl} alt={`${data.channelName} banner`} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          {channelInfo?.thumbnail && (
             <img src={channelInfo.thumbnail} alt={data.channelName} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-background" />
          )}
          <h1 className="text-2xl md:text-4xl font-bold">{data.channelName}</h1>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="shorts">Shorts</TabsTrigger>
            <TabsTrigger value="live" disabled>Ao Vivo</TabsTrigger>
          </TabsList>
          <TabsContent value="videos" className="mt-4">
            <VideoGrid videos={regularVideos} />
          </TabsContent>
          <TabsContent value="shorts" className="mt-4">
            <VideoGrid videos={shorts} />
          </TabsContent>
           <TabsContent value="live" className="mt-4">
            <p className="text-muted-foreground text-center py-8">Conteúdo ao vivo não está disponível no momento.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}