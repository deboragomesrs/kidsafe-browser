export type AllowedContent = {
  id: number;
  user_id: string;
  type: 'channel' | 'video';
  content_id: string | null;
  name: string | null;
  url: string | null;
  thumbnail_url: string | null;
  shorts_enabled: boolean;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  channelId?: string;
};

export type ChannelPageData = {
  channelId: string;
  channelName: string;
  channelThumbnail?: string;
  channelBannerUrl?: string;
  videoCount?: number;
  videos: YouTubeVideo[];
  shorts: YouTubeVideo[];
  nextPageToken?: string | null;
};