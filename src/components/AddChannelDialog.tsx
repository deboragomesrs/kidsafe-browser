import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface YouTubeChannelSearchResult {
  channelId: string;
  title: string;
  thumbnail: string;
}

interface AddChannelSettings {
  shortsEnabled: boolean;
  // rating: number; // Para uso futuro
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: YouTubeChannelSearchResult | null;
  onAddChannel: (settings: AddChannelSettings) => void;
  isAdding: boolean;
}

export default function AddChannelDialog({ open, onOpenChange, channel, onAddChannel, isAdding }: Props) {
  const [shortsEnabled, setShortsEnabled] = useState(true);
  const [rating, setRating] = useState(0);

  if (!channel) return null;

  const handleConfirm = () => {
    onAddChannel({ shortsEnabled });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-foreground border-border" translate="no">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <img src={channel.thumbnail} alt={channel.title} className="w-16 h-16 rounded-full" />
            <div>
              <DialogTitle className="text-xl text-left">{channel.title}</DialogTitle>
              <DialogDescription className="text-left">Ajuste as permissões para este canal.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <Label htmlFor="shorts-toggle" className="font-medium">Liberar YouTube Shorts?</Label>
            <Switch
              id="shorts-toggle"
              checked={shortsEnabled}
              onCheckedChange={setShortsEnabled}
            />
          </div>
          <div className="rounded-lg border p-3 shadow-sm">
            <Label className="font-medium">Classificação do Conteúdo</Label>
            <p className="text-xs text-muted-foreground mb-2">
              (Funcionalidade para o futuro: os pais poderão avaliar os canais)
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  className={cn(
                    "w-8 h-8 cursor-pointer transition-colors",
                    rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={isAdding} className="btn-kids">
            {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar e Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}