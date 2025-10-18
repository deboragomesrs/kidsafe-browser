import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AllowedContent } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  channels: AllowedContent[];
  selectedChannelId?: string | null;
  onChannelSelect: (channel: AllowedContent) => void;
}

export default function ChannelNav({ channels, selectedChannelId }: Props) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const scrollDirectionRef = useRef<'left' | 'right' | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleSelect = (channel: AllowedContent) => {
    if (channel.type === 'channel' && channel.content_id) {
      navigate(`/channel/${channel.content_id}`);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollability = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    const scrollStep = () => {
      if (scrollContainerRef.current && scrollDirectionRef.current) {
        const scrollAmount = scrollDirectionRef.current === 'left' ? -3 : 3;
        scrollContainerRef.current.scrollLeft += scrollAmount;
      }
      requestRef.current = requestAnimationFrame(scrollStep);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const activationZoneWidth = 60; // 60px from each edge

      if (mouseX < activationZoneWidth && canScrollLeft) {
        scrollDirectionRef.current = 'left';
      } else if (mouseX > rect.width - activationZoneWidth && canScrollRight) {
        scrollDirectionRef.current = 'right';
      } else {
        scrollDirectionRef.current = null;
      }
    };

    const startScrolling = () => {
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(scrollStep);
      }
    };

    const stopScrolling = () => {
      scrollDirectionRef.current = null;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    };

    checkScrollability();
    container.addEventListener('scroll', checkScrollability);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', startScrolling);
    container.addEventListener('mouseleave', stopScrolling);
    
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollability);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', startScrolling);
      container.removeEventListener('mouseleave', stopScrolling);
      resizeObserver.unobserve(container);
      stopScrolling();
    };
  }, [channels, canScrollLeft, canScrollRight]);

  return (
    <div className="relative bg-card border-b border-border">
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-card to-transparent z-10 transition-opacity duration-300 pointer-events-none",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
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
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-card to-transparent z-10 transition-opacity duration-300 pointer-events-none",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}