import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AllowedContent } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  channels: AllowedContent[];
  selectedChannelId?: string | null;
  onChannelSelect: (channel: AllowedContent) => void;
}

export default function ChannelNav({ channels, selectedChannelId }: Props) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleSelect = (channel: AllowedContent) => {
    if (channel.type === 'channel' && channel.content_id) {
      navigate(`/channel/${channel.content_id}`);
    }
  };

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      container.addEventListener('scroll', checkScrollability);
      
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener('scroll', checkScrollability);
        resizeObserver.unobserve(container);
      };
    }
  }, [channels]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative bg-card border-b border-border">
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full w-12 rounded-none bg-gradient-to-r from-card to-transparent hover:bg-card/80"
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}
      <div 
        ref={scrollContainerRef}
        className="flex gap-3 min-w-max p-2 md:p-3 overflow-x-auto no-scrollbar"
      >
        {channels.filter(c => c.type === 'channel').map((channel) => (
          <Button
            key={channel.id}
            onClick={() => handleSelect(channel)}
            variant="ghost"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors shrink-0",
              "bg-secondary text-secondary-foreground hover:bg-primary/80 hover:text-primary-foreground",
              selectedChannelId === channel.content_id && "bg-primary text-primary-foreground"
            )}
          >
            {channel.name || 'Canal'}
          </Button>
        ))}
      </div>
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full w-12 rounded-none bg-gradient-to-l from-card to-transparent hover:bg-card/80"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}