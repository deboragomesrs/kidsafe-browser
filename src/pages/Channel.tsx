import { useParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YouTubeVideo, ChannelPageData } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";
import VideoGrid from "@/components/VideoGrid";
import ShortsGrid from "@/components/ShortsGrid";
import VideoPlayer from "@/components/VideoPlayer";
import ChannelHeader from "@/components/ChannelHeader";
import { useState, useRef, useEffect } from "react";

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
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
    enabled: !!channelId,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 1. Handle loading state (query is running or channelId is not yet available)
  if (isLoading || !channelId) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erro ao Carregar Canal</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // 3. Handle no data state (query finished but returned nothing valid)
  if (!data || data.pages.length === 0 || !data.pages[0]) {
    return (
     <div className="flex flex-col items-center justify-center h-full p-8 text-center">
       <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
       <h2 className="text-2xl font-bold mb-2">Canal não encontrado</h2>
       <p className="text-muted-foreground">Não foi possível carregar os dados para este canal.</p>
     </div>
   );
  }

  // 4. If we get here, we have data.
  const channelInfo = data.pages[0];
  
  const allVideos = data.pages.flatMap((page) => page.videos) ?? [];
  const uniqueVideos = Array.from(new Map(allVideos.map(video => [video.id, video])).values());

  const allShorts = data.pages.flatMap((page) => page.shorts) ?? [];
  const uniqueShorts = Array.from(new Map(allShorts.map(short => [short.id, short])).values());

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <ChannelHeader 
          channelName={channelInfo.channelName}
          channelThumbnail={channelInfo.channelThumbnail}
          channelBannerUrl={channelInfo.channelBannerUrl}
          videoCount={channelInfo.videoCount || 0}
        />
        
        <div className="p-4 md:p-6">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="videos" className="text-base font-bold">Vídeos</TabsTrigger>
              <TabsTrigger value="shorts" className="text-base font-bold" disabled={uniqueShorts.length === 0}>Shorts</TabsTrigger>
            </TabsList>
            <TabsContent value="videos" className="mt-6">
              <VideoGrid videos={uniqueVideos} onVideoSelect={setPlayingVideo} />
            </TabsContent>
            <TabsContent value="shorts" className="mt-6">
              <ShortsGrid videos={uniqueShorts} onVideoSelect={setPlayingVideo} />
            </TabsContent>
          </Tabs>

          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : !hasNextPage && (uniqueVideos.length > 0 || uniqueShorts.length > 0) ? (
              <p className="text-muted-foreground">Fim dos resultados</p>
            ) : null}
          </div>
        </div>
      </div>
      <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />
    </>
  );
}