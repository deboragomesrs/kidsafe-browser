import { useNavigate } from "react-router-dom";
import { AllowedContent } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  channels: AllowedContent[];
  selectedChannelId?: string | null;
  onChannelSelect: (channel: AllowedContent) => void;
}

export default function ChannelNav({ channels, selectedChannelId, onChannelSelect }: Props) {
  const navigate = useNavigate();

  const handleSelect = (channel: AllowedContent) => {
    if (channel.type === 'channel') {
      navigate(`/channel/${channel.id}`);
    } else {
      // Handle video selection if needed in the future
      onChannelSelect(channel);
    }
  };

  return (
    <div className="bg-card border-b border-border p-2 md:p-3 overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {channels.filter(c => c.type === 'channel').map((channel) => (
          <Button
            key={channel.type === 'channel' ? channel.id : channel.url}
            onClick={() => handleSelect(channel)}
            variant="ghost"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              "bg-secondary text-secondary-foreground hover:bg-primary/80 hover:text-primary-foreground",
              selectedChannelId === (channel.type === 'channel' ? channel.id : null) && "bg-primary text-primary-foreground"
            )}
          >
            {channel.type === 'channel' ? channel.name : 'Vídeo'}
          </Button>
        ))}
      </div>
    </div>
  );
}