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

  // Efeito para verificar a necessidade dos botões de rolagem
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollability = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    checkScrollability(); // Checagem inicial

    container.addEventListener('scroll', checkScrollability, { passive: true });
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollability);
      resizeObserver.unobserve(container);
    };
  }, [channels]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = (container.clientWidth / 2) * (direction === 'left' ? -1 : 1);
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-card border-b border-border group">
      {/* Botão de Rolagem para a Esquerda */}
      <div className={cn(
        "absolute left-0 top-0 h-full z-20 flex items-center transition-opacity duration-300",
        canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="h-full w-12 bg-gradient-to-r from-card to-transparent" />
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-8 w-8 -ml-10 bg-background/80 hover:bg-background"
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Contêiner de Rolagem */}
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

      {/* Botão de Rolagem para a Direita */}
      <div className={cn(
        "absolute right-0 top-0 h-full z-20 flex items-center transition-opacity duration-300",
        canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-8 w-8 -mr-10 bg-background/80 hover:bg-background"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <div className="h-full w-12 bg-gradient-to-l from-card to-transparent" />
      </div>
    </div>
  );
}