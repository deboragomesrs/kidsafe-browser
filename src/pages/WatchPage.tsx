import { useParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YouTubeVideo, ChannelPageData } from "@/types";
import { Loader2 } from "lucide-react";
import EmbeddedVideoPlayer from "@/components/EmbeddedVideoPlayer";
import VideoList from "@/components/VideoList";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRef, useEffect } from 'react';

interface VideoDetails extends YouTubeVideo {
  description: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
}

const fetchVideoDetails = async (videoId: string): Promise<VideoDetails> => {
  const { data, error } = await supabase.functions.invoke("fetch-youtube-video-details", {
    body: { videoId },
  });
  if (error) throw new Error(error.message);
  return data;
};

const fetchChannelVideos = async (channelId: string, pageToken?: string | null): Promise<ChannelPageData> => {
  const { data, error } = await supabase.functions.invoke("fetch-youtube-channel-videos", {
    body: { channelId, pageToken },
  });
  if (error) throw new Error(error.message);
  return data;
};

export default function WatchPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: video, isLoading: isLoadingVideo, error: videoError } = useQuery({
    queryKey: ["videoDetails", videoId],
    queryFn: () => fetchVideoDetails(videoId!),
    enabled: !!videoId,
  });

  const { 
    data: channelData, 
    isLoading: isLoadingChannel, 
    error: channelError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["channelVideos", video?.channelId],
    queryFn: ({ pageParam }) => fetchChannelVideos(video!.channelId, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: undefined,
    enabled: !!video?.channelId,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
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

  if (isLoadingVideo || (video && isLoadingChannel && !channelData)) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const error = videoError || channelError;
  if (error) {
    return <div className="p-8 text-center text-destructive">Erro: {error.message}</div>;
  }

  if (!video) {
    return <div className="p-8 text-center">Vídeo não encontrado.</div>;
  }

  const allVideos = channelData?.pages.flatMap(page => [...(page?.videos || []), ...(page?.shorts || [])]) || [];

  return (
    <div className="container mx-auto max-w-7xl py-4 pl-4 lg:py-6 lg:pl-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Coluna Principal (Vídeo e Detalhes) */}
        <div className="lg:col-span-2">
          <EmbeddedVideoPlayer videoId={video.id} />
          <div className="mt-4">
            <h1 className="text-xl font-bold md:text-2xl">{video.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{video.channelTitle}</span>
              <span>{Number(video.viewCount).toLocaleString('pt-BR')} visualizações</span>
              <span>{formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true, locale: ptBR })}</span>
            </div>
            <div className="mt-4 rounded-xl bg-secondary p-4 text-sm">
              <p className="whitespace-pre-wrap">{video.description.substring(0, 200)}...</p>
            </div>
          </div>
        </div>

        {/* Coluna Lateral (Próximos Vídeos) */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-bold">Próximos vídeos</h2>
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar">
            <VideoList videos={allVideos} currentVideoId={videoId} />
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage && (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}