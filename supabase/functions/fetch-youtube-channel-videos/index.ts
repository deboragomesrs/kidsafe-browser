// Re-deploy trigger v3
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseDuration(isoDuration: string): number {
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
    const { channelId } = await req.json();
    if (!channelId) throw new Error("Channel ID is required.");

    // 1. Pegar informações e estatísticas do canal
    const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`);
    const channelData = await channelRes.json();
    if (!channelRes.ok || !channelData.items?.length) throw new Error("Channel details not found.");
    
    const channelDetails = channelData.items[0];
    const channelName = channelDetails.snippet.title;
    const channelThumbnail = channelDetails.snippet.thumbnails.default.url;
    const channelBannerUrl = channelDetails.brandingSettings?.image?.bannerExternalUrl;
    const videoCount = channelDetails.statistics?.videoCount;

    // 2. Puxar vídeos (geral, em alta)
    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet&order=viewCount&type=video&maxResults=50`);
    const searchData = await searchRes.json();
    if (!searchRes.ok) throw new Error("Failed to search for videos.");

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // 3. Puxar detalhes dos vídeos para filtrar por duração (Shorts)
    const videosRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`);
    const videosData = await videosRes.json();
    if (!videosRes.ok) throw new Error("Failed to fetch video details.");

    const videos: any[] = [];
    const shorts: any[] = [];

    videosData.items.forEach((item: any) => {
      const durationInSeconds = parseDuration(item.contentDetails.duration);
      const videoObject = {
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        url: `https://www.youtube.com/watch?v=${item.id}`,
      };
      if (durationInSeconds > 0 && durationInSeconds < 61) {
        shorts.push(videoObject);
      } else {
        videos.push(videoObject);
      }
    });

    // 4. Puxar vídeos Ao Vivo
    const liveRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet&type=video&eventType=live`);
    const liveData = await liveRes.json();
    if (!liveRes.ok) throw new Error("Failed to search for live streams.");

    const live = liveData.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return new Response(JSON.stringify({
      channelId,
      channelName,
      channelThumbnail,
      channelBannerUrl,
      videoCount,
      videos,
      shorts,
      live,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});