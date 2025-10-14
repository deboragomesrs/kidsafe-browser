// Versão 2.0 - Lógica unificada e análise de URL robusta
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper para converter a duração do vídeo do formato do YouTube para segundos
function parseDuration(isoDuration?: string): number {
  if (!isoDuration) return 0;
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');
  const seconds = parseInt(matches[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!YOUTUBE_API_KEY) {
    return new Response(JSON.stringify({ error: "YouTube API Key not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { channelId, channelUrl, pageToken } = await req.json();
    let finalChannelId = channelId;

    if (!finalChannelId && !channelUrl) {
      throw new Error("Either channelId or channelUrl must be provided.");
    }

    // --- Parte 1: Resolver a URL para um ID de Canal, se necessário ---
    if (channelUrl && !finalChannelId) {
      const url = new URL(channelUrl);
      const pathParts = url.pathname.split('/').filter(p => p);

      if (pathParts[0] === 'channel' && pathParts[1]) {
        finalChannelId = pathParts[1];
      } else if (pathParts[0] && pathParts[0].startsWith('@')) {
        const handle = pathParts[0].substring(1);
        const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${handle}&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        if (!res.ok || !data.items?.length) throw new Error(`Could not find channel for handle: @${handle}`);
        finalChannelId = data.items[0].id;
      } else if ((pathParts[0] === 'user' || pathParts[0] === 'c') && pathParts[1]) {
        const username = pathParts[1];
        const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${username}&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        if (!res.ok || !data.items?.length) throw new Error(`Could not find channel for name: ${username}`);
        finalChannelId = data.items[0].id;
      } else {
        throw new Error("Invalid or unsupported YouTube channel URL format.");
      }
    }

    if (!finalChannelId) {
      throw new Error("Could not determine Channel ID.");
    }

    // --- Parte 2: Buscar Detalhes do Canal e Vídeos ---
    const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,brandingSettings,statistics&id=${finalChannelId}&key=${YOUTUBE_API_KEY}`);
    const channelData = await channelRes.json();
    if (!channelRes.ok || !channelData.items?.length) throw new Error("Channel details not found.");
    
    const channelDetails = channelData.items[0];
    const uploadsPlaylistId = channelDetails.contentDetails.relatedPlaylists.uploads;

    const playlistUrl = new URL(`https://www.googleapis.com/youtube/v3/playlistItems`);
    playlistUrl.searchParams.set('part', 'snippet');
    playlistUrl.searchParams.set('playlistId', uploadsPlaylistId);
    playlistUrl.searchParams.set('maxResults', '50');
    playlistUrl.searchParams.set('key', YOUTUBE_API_KEY);
    if (pageToken) {
      playlistUrl.searchParams.set('pageToken', pageToken);
    }
    
    const playlistRes = await fetch(playlistUrl.toString());
    const playlistData = await playlistRes.json();
    if (!playlistRes.ok) throw new Error("Failed to fetch playlist items.");

    const nextPageToken = playlistData.nextPageToken || null;
    const videoIds = playlistData.items
      .map((item: any) => item.snippet?.resourceId?.videoId)
      .filter(Boolean)
      .join(',');

    let videosData = { items: [] };
    if (videoIds) {
      const videosRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`);
      if (!videosRes.ok) throw new Error("Failed to fetch video details.");
      videosData = await videosRes.json();
    }

    const videos: any[] = [];
    const shorts: any[] = [];

    videosData.items.forEach((item: any) => {
      const durationInSeconds = parseDuration(item.contentDetails?.duration);
      const title = item.snippet?.title || '';
      
      const videoObject = {
        id: item.id,
        title: title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        url: `https://www.youtube.com/watch?v=${item.id}`,
      };
      
      const isShort = title.toLowerCase().includes('#shorts') || (durationInSeconds > 0 && durationInSeconds <= 60);

      if (isShort) {
        shorts.push(videoObject);
      } else {
        videos.push(videoObject);
      }
    });

    const responsePayload = {
      channelId: finalChannelId,
      channelName: channelDetails.snippet.title,
      channelThumbnail: channelDetails.snippet.thumbnails.default.url,
      channelBannerUrl: channelDetails.brandingSettings?.image?.bannerExternalUrl,
      videoCount: channelDetails.statistics?.videoCount,
      videos,
      shorts,
      nextPageToken,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Edge Function Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});