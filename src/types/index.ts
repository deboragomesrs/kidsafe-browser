export type AllowedContent =
  | { type: 'video'; url: string; title?: string; thumbnail?: string }
  | { type: 'channel'; id: string; name: string; url?: string; thumbnail?: string };

export type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  channelId?: string; // Adicionado para saber de qual canal o vídeo veio
};

export type ChannelDetails = {
  channelId: string;
  channelName: string;
  channelBannerUrl?: string;
  videos: YouTubeVideo[];
};