import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AllowedContent } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  channels: AllowedContent[];
  selectedChannelId?: string | null;
}

export default function TopChannelsCarousel({ channels, selectedChannelId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollVelocityRef = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const navigate = useNavigate();

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const containerWidth = rect.width;

    // Define uma zona neutra no centro (40% da largura total)
    const deadZoneStart = containerWidth * 0.3;
    const deadZoneEnd = containerWidth * 0.7;
    const maxSpeed = 8; // Velocidade máxima de rolagem

    if (mouseX > deadZoneStart && mouseX < deadZoneEnd) {
      scrollVelocityRef.current = 0; // Parado na zona neutra
      return;
    }

    if (mouseX < deadZoneStart) {
      // Rolagem para a esquerda
      const intensity = (deadZoneStart - mouseX) / deadZoneStart;
      scrollVelocityRef.current = -intensity * maxSpeed;
    } else {
      // Rolagem para a direita
      const intensity = (mouseX - deadZoneEnd) / (containerWidth - deadZoneEnd);
      scrollVelocityRef.current = intensity * maxSpeed;
    }
  };

  const handleMouseLeave = () => {
    scrollVelocityRef.current = 0; // Para de rolar quando o mouse sai
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      if (scrollVelocityRef.current !== 0) {
        container.scrollLeft += scrollVelocityRef.current;
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const handleSelect = (channel: AllowedContent) => {
    if (channel.type === 'channel' && channel.content_id) {
      navigate(`/channel/${channel.content_id}`);
    }
  };

  return (
    <div
      className="overflow-hidden whitespace-nowrap w-full bg-card border-b border-border cursor-pointer"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex gap-6 px-3 py-3 pointer-events-none"> {/* pointer-events-none para evitar que os botões interfiram no mousemove */}
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleSelect(channel)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors shrink-0 pointer-events-auto", // reativa os eventos de ponteiro para os botões
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