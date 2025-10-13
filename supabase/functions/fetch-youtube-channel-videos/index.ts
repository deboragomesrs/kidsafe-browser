// Acionando a reimplantação para buscar vídeos por popularidade
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API Key not configured.");
    return new Response(JSON.stringify({ error: "YouTube API Key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { channelId, channelUrl } = await req.json();
    let finalChannelId = channelId;
    let channelName = "Canal";
    let channelThumbnail = "";

    if (channelUrl && !finalChannelId) {
      const handleMatch = channelUrl.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
      const idMatch = channelUrl.match(/youtube\.com\/(channel|user)\/([a-zA-Z0-9_-]+)/);
      
      let lookupParam: string | null = null;
      if (handleMatch) {
        lookupParam = `forHandle=${handleMatch[1]}`;
      } else if (idMatch && idMatch[1] === 'user') {
        lookupParam = `forUsername=${idMatch[2]}`;
      } else if (idMatch && idMatch[1] === 'channel') {
        finalChannelId = idMatch[2];
      }

      if (lookupParam) {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&${lookupParam}&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        
        if (res.ok && data.items && data.items.length > 0) {
          finalChannelId = data.items[0].id;
        } else {
          console.error("YouTube API Error (Lookup):", data);
          throw new Error("Canal não encontrado pela URL. Verifique se a URL está correta.");
        }
      }
    }

    if (!finalChannelId) throw new Error("ID do canal não pôde ser determinado. Verifique a URL.");

    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,brandingSettings&id=${finalChannelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelRes.json();

    if (!channelRes.ok || !channelData.items || channelData.items.length === 0) {
      console.error("YouTube API Error (Channel Details):", channelData);
      throw new Error("Detalhes do canal não encontrados.");
    }

    const channelDetails = channelData.items[0];
    channelName = channelDetails.snippet.title;
    channelThumbnail = channelDetails.snippet.thumbnails.default.url;
    const channelBannerUrl = channelDetails.brandingSettings?.image?.bannerExternalUrl;

    // Alterado para buscar os vídeos mais populares usando a API de Pesquisa
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${finalChannelId}&order=viewCount&type=video&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      console.error("YouTube API Error (Search):", searchData);
      throw new Error("Falha ao buscar os vídeos mais populares do canal.");
    }

    const videos = (searchData.items || [])
      .filter((item: any) => item.id?.kind === "youtube#video")
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));

    return new Response(JSON.stringify({ 
      channelId: finalChannelId, 
      channelName, 
      channelThumbnail,
      channelBannerUrl,
      videos 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});