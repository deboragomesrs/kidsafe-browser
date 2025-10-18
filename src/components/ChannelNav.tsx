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
  const intervalRef = useRef<number | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleSelect = (channel: AllowedContent) => {
    if (channel.type === 'channel' && channel.content_id) {
      navigate(`/channel/${channel.content_id}`);
    }
  };

  // Função para verificar se a rolagem é possível
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      // Usamos um threshold de 1px para evitar falsos positivos/negativos
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Efeito para monitorar o tamanho e a posição da rolagem
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollability(); // Checagem inicial

    container.addEventListener('scroll', checkScrollability, { passive: true });
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollability);
      resizeObserver.unobserve(container);
    };
  }, [channels]); // Reavalia se a lista de canais mudar

  const stopScrolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startScrolling = (direction: 'left' | 'right') => {
    stopScrolling(); // Garante que não haja múltiplos intervalos rodando
    intervalRef.current = window.setInterval(() => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === 'left' ? -8 : 8;
        scrollContainerRef.current.scrollLeft += scrollAmount;
      }
    }, 30); // Intervalo rápido para uma rolagem suave
  };

  // Efeito para limpar o intervalo quando o componente for desmontado
  useEffect(() => {
    return () => stopScrolling();
  }, []);

  return (
    <div className="relative bg-card border-b border-border">
      {/* Contêiner principal que permite rolagem nativa por toque */}
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

      {/* Zona de ativação de rolagem para a ESQUERDA (Desktop) */}
      <div
        onMouseEnter={() => startScrolling('left')}
        onMouseLeave={stopScrolling}
        className="absolute left-0 top-0 h-full w-16 z-20"
        style={{ display: canScrollLeft ? 'block' : 'none' }}
      />
      {/* Gradiente Esquerdo */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-card to-transparent z-10 transition-opacity duration-300 pointer-events-none",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Zona de ativação de rolagem para a DIREITA (Desktop) */}
      <div
        onMouseEnter={() => startScrolling('right')}
        onMouseLeave={stopScrolling}
        className="absolute right-0 top-0 h-full w-16 z-20"
        style={{ display: canScrollRight ? 'block' : 'none' }}
      />
      {/* Gradiente Direito */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-card to-transparent z-10 transition-opacity duration-300 pointer-events-none",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}