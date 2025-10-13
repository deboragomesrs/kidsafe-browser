import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  channelName: string;
  channelThumbnail?: string;
  channelBannerUrl?: string;
  videoCount: number;
}

export default function ChannelHeader({ channelName, channelThumbnail, channelBannerUrl, videoCount }: Props) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full">
      <Button 
        onClick={() => navigate("/")}
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
      >
        <ArrowLeft className="w-6 h-6" />
      </Button>

      <div className="w-full h-32 md:h-40 bg-yellow-300">
        {channelBannerUrl && (
          <img src={channelBannerUrl} alt={`${channelName} banner`} className="w-full h-full object-cover" />
        )}
      </div>
      
      <div className="p-4 bg-card">
        <div className="flex items-center gap-4 -mt-12 md:-mt-14">
          {channelThumbnail && (
            <img 
              src={channelThumbnail} 
              alt={channelName} 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-card bg-secondary" 
            />
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mt-10">{channelName}</h1>
            <p className="text-sm text-muted-foreground">{videoCount} vídeos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
