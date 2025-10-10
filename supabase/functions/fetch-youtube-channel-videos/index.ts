import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

serve(async (req) => {
  console.log("Edge Function received request.");
  console.log("YOUTUBE_API_KEY_STATUS:", YOUTUBE_API_KEY ? "Configured" : "NOT Configured");

  if (req.method !== "POST") {
    console.error("Method Not Allowed:", req.method);
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const requestBody = await req.json();
    const { channelId, channelUrl } = requestBody;
    console.log("Request Body:", requestBody);

    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API Key not configured in Edge Function environment.");
      return new Response(JSON.stringify({ error: "YouTube API Key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    let finalChannelId = channelId;
    let channelName = "Canal do YouTube"; // Default name

    // If channelUrl is provided, try to extract channelId and name
    if (channelUrl && !finalChannelId) {
      const channelHandleMatch = channelUrl.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
      const channelIdMatch = channelUrl.match(/(?:youtube\.com\/channel\/|youtube\.com\/user\/)([a-zA-Z0-9_-]+)/);

      if (channelHandleMatch) {
        console.log("Attempting to fetch channel by handle:", channelHandleMatch[1]);
        const handleResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${channelHandleMatch[1]}&key=${YOUTUBE_API_KEY}`
        );
        const handleData = await handleResponse.json();
        if (handleResponse.ok && handleData.items.length > 0) {
          finalChannelId = handleData.items[0].id;
          channelName = handleData.items[0].snippet.title;
          console.log("Channel found by handle. ID:", finalChannelId, "Name:", channelName);
        } else {
          console.error("YouTube API Error (Handle):", handleData);
          return new Response(JSON.stringify({ error: handleData.error?.message || "Failed to find channel by handle" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      } else if (channelIdMatch) {
        finalChannelId = channelIdMatch[1];
        console.log("Channel ID extracted from URL:", finalChannelId);
      } else {
        console.error("Invalid YouTube channel URL or ID provided:", channelUrl);
        return new Response(JSON.stringify({ error: "Invalid YouTube channel URL or ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (!finalChannelId) {
      console.error("Final Channel ID is missing.");
      return new Response(JSON.stringify({ error: "Channel ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 1: Get the uploads playlist ID for the channel and channel name if not already set
    console.log("Fetching channel details for ID:", finalChannelId);
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${finalChannelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();

    if (!channelResponse.ok || channelData.items.length === 0) {
      console.error("YouTube API Error (Channel Details):", channelData);
      return new Response(JSON.stringify({ error: channelData.error?.message || "Failed to fetch channel details or channel not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    if (channelName === "Canal do YouTube") { // Update name if default
      channelName = channelData.items[0].snippet.title;
    }
    console.log("Uploads Playlist ID:", uploadsPlaylistId, "Channel Name:", channelName);

    // Step 2: Get videos from the uploads playlist
    console.log("Fetching videos from playlist:", uploadsPlaylistId);
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=20&key=${YOUTUBE_API_KEY}`
    );
    const playlistData = await playlistResponse.json();

    if (!playlistResponse.ok) {
      console.error("YouTube API Error (Playlist Items):", playlistData);
      return new Response(JSON.stringify({ error: playlistData.error?.message || "Failed to fetch playlist items" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const videos = playlistData.items
      .filter((item: any) => item.snippet.resourceId.kind === "youtube#video")
      .map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || 'https://via.placeholder.com/120x90?text=No+Thumbnail',
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      }));
    
    console.log("Fetched videos count:", videos.length);
    // console.log("Fetched videos:", videos); // Descomente para ver os detalhes dos vídeos no log

    return new Response(JSON.stringify({ channelId: finalChannelId, channelName, videos }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge Function Unhandled Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});