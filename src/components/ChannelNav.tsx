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
  const animationFrameRef = useRef<number>();
  const scrollDirectionRef = useRef<'left' | 'right' | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleSelect = (channel: AllowedContent) => {
    if (channel.type === 'channel' && channel.content_id) {
      navigate(`/channel/${channel.content_id}`);
    }
  };

  // Este useEffect é responsável por toda a lógica de rolagem e listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Função para verificar se a rolagem é possível
    const checkScrollability = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    // O loop de animação que faz a rolagem suave
    const scrollStep = () => {
      if (scrollDirectionRef.current) {
        const scrollAmount = scrollDirectionRef.current === 'left' ? -4 : 4;
        container.scrollLeft += scrollAmount;
      }
      animationFrameRef.current = requestAnimationFrame(scrollStep);
    };

    // Inicia o loop de animação
    const startScrolling = () => {
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(scrollStep);
      }
    };

    // Para o loop de animação
    const stopScrolling = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };

    // Lida com o movimento do mouse para definir a direção da rolagem
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const activationZoneWidth = 80; // Aumentei a zona de ativação para 80px

      // Usamos uma função de callback no setState para garantir que temos o valor mais recente
      // Isso evita o problema de "stale state"
      let newDirection: 'left' | 'right' | null = null;
      if (mouseX < activationZoneWidth) {
        setCanScrollLeft(current => {
          if (current) newDirection = 'left';
          return current;
        });
      } else if (mouseX > rect.width - activationZoneWidth) {
        setCanScrollRight(current => {
          if (current) newDirection = 'right';
          return current;
        });
      }
      scrollDirectionRef.current = newDirection;
    };

    // Adiciona os listeners
    checkScrollability();
    container.addEventListener('scroll', checkScrollability, { passive: true });
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', startScrolling);
    container.addEventListener('mouseleave', () => { scrollDirectionRef.current = null; });
    
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(container);

    // Função de limpeza para remover os listeners quando o componente for desmontado
    return () => {
      stopScrolling();
      container.removeEventListener('scroll', checkScrollability);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', startScrolling);
      container.removeEventListener('mouseleave', () => { scrollDirectionRef.current = null; });
      resizeObserver.unobserve(container);
    };
  }, [channels]); // A lógica é re-executada se a lista de canais mudar

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