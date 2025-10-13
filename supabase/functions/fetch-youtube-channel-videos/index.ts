// Re-deploy trigger v9 - Attempting re-deploy after environment issue
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { channelId, pageToken } = await req.json();
    if (!channelId) throw new Error("Channel ID is required.");

    const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,brandingSettings,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`);
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
      
      // More robust classification: check for #shorts tag OR duration <= 60s
      const isShort = title.toLowerCase().includes('#shorts') || (durationInSeconds > 0 && durationInSeconds <= 60);

      if (isShort) {
        shorts.push(videoObject);
      } else {
        videos.push(videoObject);
      }
    });

    const responsePayload = {
      channelId,
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});