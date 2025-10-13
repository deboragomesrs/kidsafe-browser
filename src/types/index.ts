export type AllowedContent =
  | { type: 'video'; url: string; title?: string; thumbnail?: string }
  | { type: 'channel'; id: string; name: string; url?: string; thumbnail?: string };

export type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  channelId?: string;
};

export type ChannelDetails = {
  channelId: string;
  channelName: string;
  channelThumbnail?: string;
  channelBannerUrl?: string;
  videoCount?: number;
  videos: YouTubeVideo[];
  shorts: YouTubeVideo[];
  live: YouTubeVideo[];
};