import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AllowedContent } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  channels: AllowedContent[];
  selectedChannelId?: string | null;
}

export default function TopChannelsCarousel({ channels, selectedChannelId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState(1); // 1 = para a direita, -1 = para a esquerda
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // Só anima se o conteúdo for maior que o contêiner
    if (content.scrollWidth <= container.clientWidth) return;

    const scrollSpeed = 0.5; // Velocidade da rolagem
    let frameId: number;

    const animate = () => {
      if (!isPaused) {
        container.scrollLeft += scrollSpeed * direction;

        // Inverte a direção ao chegar nas extremidades
        if (direction === 1 && container.scrollLeft + container.clientWidth >= content.scrollWidth) {
          setDirection(-1);
        } else if (direction === -1 && container.scrollLeft <= 0) {
          setDirection(1);
        }
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [direction, isPaused, channels]);

  const handleSelect = (channel: AllowedContent) => {
    if (channel.type === 'channel' && channel.content_id) {
      navigate(`/channel/${channel.content_id}`);
    }
  };

  // Duplicamos a lista para criar um efeito de rolagem "infinita" e suave
  const duplicatedChannels = [...channels, ...channels];

  return (
    <div
      className="overflow-hidden whitespace-nowrap w-full bg-card border-b border-border cursor-pointer"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={containerRef}
    >
      <div ref={contentRef} className="flex gap-6 px-3 py-3">
        {duplicatedChannels.map((channel, i) => (
          <button
            key={`${channel.id}-${i}`}
            onClick={() => handleSelect(channel)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors shrink-0",
              "bg-secondary text-secondary-foreground hover:bg-primary/80 hover:text-primary-foreground",
              selectedChannelId === channel.content_id && "bg-primary text-primary-foreground"
            )}
          >
            {channel.name || 'Canal'}
          </button>
        ))}
      </div>
    </div>
  );
}