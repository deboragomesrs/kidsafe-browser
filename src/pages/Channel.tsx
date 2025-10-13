import { useParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YouTubeVideo, ChannelPageData } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";
import VideoGrid from "@/components/VideoGrid";
import ShortsGrid from "@/components/ShortsGrid"; // Importando o novo componente
import VideoPlayer from "@/components/VideoPlayer";
import ChannelHeader from "@/components/ChannelHeader";
import { useState, useRef, useCallback } from "react";

const fetchChannelDetails = async (channelId: string, pageToken?: string | null): Promise<ChannelPageData> => {
  const { data, error } = await supabase.functions.invoke("fetch-youtube-channel-videos", {
    body: { channelId, pageToken },
  });

  if (error) throw new Error(error.message || "Falha ao buscar detalhes do canal.");
  if (!data) throw new Error("Resposta inválida do servidor.");
  return data;
};

export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<ChannelPageData, Error>({
    queryKey: ["channel", channelId],
    queryFn: ({ pageParam }) => fetchChannelDetails(channelId!, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: undefined,
  });

  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

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

  const channelInfo = data?.pages[0];
  const allVideos = data?.pages.flatMap((page) => page.videos) ?? [];
  const allShorts = data?.pages.flatMap((page) => page.shorts) ?? [];

  return (
    <>
      <div className="w-full h-full flex flex-col">
        {channelInfo && (
          <ChannelHeader 
            channelName={channelInfo.channelName}
            channelThumbnail={channelInfo.channelThumbnail}
            channelBannerUrl={channelInfo.channelBannerUrl}
            videoCount={channelInfo.videoCount || 0}
          />
        )}
        
        <div className="p-4 md:p-6">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="videos" className="text-base font-bold">Vídeos</TabsTrigger>
              <TabsTrigger value="shorts" className="text-base font-bold" disabled={allShorts.length === 0}>Shorts</TabsTrigger>
            </TabsList>
            <TabsContent value="videos" className="mt-6">
              <VideoGrid videos={allVideos} onVideoSelect={setPlayingVideo} />
            </TabsContent>
            <TabsContent value="shorts" className="mt-6">
              <ShortsGrid videos={allShorts} onVideoSelect={setPlayingVideo} />
            </TabsContent>
          </Tabs>

          <div ref={lastElementRef} className="h-8 flex justify-center items-center">
            {isFetchingNextPage && <Loader2 className="w-8 h-8 animate-spin text-primary" />}
          </div>
        </div>
      </div>
      <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />
    </>
  );
}