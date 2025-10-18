import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AllowedContent } from "@/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  channels: AllowedContent[];
  selectedChannelId?: string | null;
}

export default function TopChannelsCarousel({ channels, selectedChannelId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // --- Lógica apenas para Desktop ---
  const scrollVelocityRef = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const containerWidth = rect.width;

    const deadZoneStart = containerWidth * 0.3;
    const deadZoneEnd = containerWidth * 0.7;
    const maxSpeed = 8;

    if (mouseX > deadZoneStart && mouseX < deadZoneEnd) {
      scrollVelocityRef.current = 0;
      return;
    }

    if (mouseX < deadZoneStart) {
      const intensity = (deadZoneStart - mouseX) / deadZoneStart;
      scrollVelocityRef.current = -intensity * maxSpeed;
    } else {
      const intensity = (mouseX - deadZoneEnd) / (containerWidth - deadZoneEnd);
      scrollVelocityRef.current = intensity * maxSpeed;
    }
  };

  const handleMouseLeave = () => {
    scrollVelocityRef.current = 0;
  };

  useEffect(() => {
    // Este efeito de animação só roda no desktop
    if (isMobile) return;

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
  }, [isMobile]);

  const handleSelect = (channel: AllowedContent) => {
    if (channel.type === 'channel' && channel.content_id) {
      navigate(`/channel/${channel.content_id}`);
    }
  };

  return (
    <div
      className={cn(
        "w-full bg-card border-b border-border",
        // No celular, usamos a rolagem nativa do navegador. No desktop, controlamos via JS.
        isMobile ? "overflow-x-auto" : "overflow-hidden cursor-pointer",
        "no-scrollbar" // Esconde a barra de rolagem visualmente
      )}
      ref={containerRef}
      // Atribuímos os eventos de mouse apenas no desktop
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
    >
      <div className={cn(
        "flex gap-6 px-3 py-3 whitespace-nowrap",
        // O truque de pointer-events só é necessário para o mousemove do desktop
        !isMobile && "pointer-events-none"
      )}>
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleSelect(channel)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors shrink-0",
              "bg-secondary text-secondary-foreground hover:bg-primary/80 hover:text-primary-foreground",
              selectedChannelId === channel.content_id && "bg-primary text-primary-foreground",
              !isMobile && "pointer-events-auto" // Reativa os eventos nos botões para o desktop
            )}
          >
            {channel.name || 'Canal'}
          </button>
        ))}
      </div>
    </div>
  );
}