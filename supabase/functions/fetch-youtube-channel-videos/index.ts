// Versão 2.1 - Análise de URL mais robusta e logging aprimorado
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
  console.log("Function invoked.");
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY is not configured.");
    return new Response(JSON.stringify({ error: "YouTube API Key not configured on server" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { channelId, channelUrl, pageToken } = await req.json();
    console.log(`Received request with channelId: ${channelId}, channelUrl: ${channelUrl}`);
    let finalChannelId = channelId;

    if (!finalChannelId && !channelUrl) {
      throw new Error("Either channelId or channelUrl must be provided.");
    }

    if (channelUrl && !finalChannelId) {
      console.log(`Attempting to parse URL: ${channelUrl}`);
      let cleanUrl = channelUrl.trim();
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = `https://` + cleanUrl;
      }
      
      try {
        const url = new URL(cleanUrl);
        const pathParts = url.pathname.split('/').filter(p => p);
        console.log(`Parsed path parts: ${JSON.stringify(pathParts)}`);

        if (pathParts[0] === 'channel' && pathParts[1]) {
          finalChannelId = pathParts[1];
          console.log(`Found channel ID in path: ${finalChannelId}`);
        } else if (pathParts[0] && pathParts[0].startsWith('@')) {
          const handle = pathParts[0].substring(1);
          console.log(`Found handle: @${handle}, fetching ID...`);
          const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${handle}&key=${YOUTUBE_API_KEY}`);
          const data = await res.json();
          if (!res.ok || !data.items?.length) throw new Error(`Could not find channel for handle: @${handle}`);
          finalChannelId = data.items[0].id;
          console.log(`Resolved handle to channel ID: ${finalChannelId}`);
        } else if ((pathParts[0] === 'user' || pathParts[0] === 'c') && pathParts[1]) {
          const username = pathParts[1];
          console.log(`Found username/c: ${username}, fetching ID...`);
          const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${username}&key=${YOUTUBE_API_KEY}`);
          const data = await res.json();
          if (!res.ok || !data.items?.length) throw new Error(`Could not find channel for name: ${username}`);
          finalChannelId = data.items[0].id;
          console.log(`Resolved username to channel ID: ${finalChannelId}`);
        } else {
          throw new Error("Invalid or unsupported YouTube channel URL format.");
        }
      } catch (e: any) {
        console.error("Error parsing URL:", e.message);
        throw new Error("Invalid URL format. Please provide a full YouTube channel URL.");
      }
    }

    if (!finalChannelId) {
      throw new Error("Could not determine Channel ID from the provided URL.");
    }
    console.log(`Final Channel ID to use: ${finalChannelId}`);

    const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,brandingSettings,statistics&id=${finalChannelId}&key=${YOUTUBE_API_KEY}`);
    const channelData = await channelRes.json();
    if (!channelRes.ok || !channelData.items?.length) {
      console.error("Failed to fetch channel details:", channelData);
      throw new Error("Channel details not found on YouTube.");
    }
    
    const channelDetails = channelData.items[0];
    const uploadsPlaylistId = channelDetails.contentDetails.relatedPlaylists.uploads;
    console.log(`Found uploads playlist ID: ${uploadsPlaylistId}`);

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
    if (!playlistRes.ok) {
      console.error("Failed to fetch playlist items:", playlistData);
      throw new Error("Failed to fetch playlist items from YouTube.");
    }

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

    console.log("Function finished successfully.");
    return new Response(JSON.stringify(responsePayload), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Edge Function CRITICAL Error:", error.message);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});