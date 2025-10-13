import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AllowedContent } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onSwitchToChild: () => void;
}

export default function ParentPanel({ onSwitchToChild }: Props) {
  const [allowedContent, setAllowedContent] = useState<AllowedContent[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("barraKidsAllowedContent");
    if (saved) {
      try {
        setAllowedContent(JSON.parse(saved));
      } catch {
        setAllowedContent([]);
      }
    }
  }, []);

  const saveContent = (content: AllowedContent[]) => {
    localStorage.setItem("barraKidsAllowedContent", JSON.stringify(content));
    setAllowedContent(content);
  };

  const addContent = async () => {
    if (!newUrl.trim() || isLoading) {
      return;
    }
    setIsLoading(true);

    const url = newUrl.trim();
    let contentToAdd: AllowedContent | null = null;

    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (videoIdMatch) {
      contentToAdd = { type: 'video', url: `https://www.youtube.com/watch?v=${videoIdMatch[1]}` };
    } else {
      try {
        toast.loading("Verificando canal...");
        
        const { data, error } = await supabase.functions.invoke('fetch-youtube-channel-videos', {
          body: { channelUrl: url }
        });

        toast.dismiss();

        if (error) throw new Error(error.message || "Falha ao buscar detalhes do canal.");
        if (!data || !data.channelId) throw new Error("Resposta inválida do servidor.");
        
        contentToAdd = { 
          type: 'channel', 
          id: data.channelId, 
          name: data.channelName, 
          url: url,
          thumbnail: data.channelThumbnail
        };
        toast.success(`Canal "${data.channelName}" adicionado!`);

      } catch (error: any) {
        toast.dismiss();
        toast.error(`Erro: ${error.message}`);
        setIsLoading(false);
        return;
      }
    }

    if (contentToAdd) {
      const updated = [...allowedContent, contentToAdd];
      saveContent(updated);
      setNewUrl("");
      if (contentToAdd.type === 'video') {
        toast.success("URL de vídeo adicionada!");
      }
    }
    setIsLoading(false);
  };

  const removeContent = (index: number) => {
    const updated = allowedContent.filter((_, i) => i !== index);
    saveContent(updated);
    toast.success("Conteúdo removido");
  };

  return (
    <div className="w-full h-full p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="card-kids mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">
              Painel dos Pais
            </h1>
          </div>

          <p className="text-muted-foreground mb-6">
            Adicione URLs de canais ou vídeos do YouTube que seus filhos podem assistir.
          </p>

          <div className="flex gap-2 mb-6">
            <Input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Ex: youtube.com/watch?v=... ou youtube.com/@canal"
              className="flex-1 rounded-xl bg-input text-foreground border-border"
              onKeyPress={(e) => e.key === "Enter" && addContent()}
              disabled={isLoading}
            />
            <Button
              onClick={addContent}
              className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80"
              disabled={isLoading}
            >
              <Plus className="w-5 h-5 mr-2" />
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              Conteúdo Permitido ({allowedContent.length})
            </h2>
            {allowedContent.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum conteúdo adicionado ainda.
              </p>
            ) : (
              allowedContent.map((content, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-secondary p-3 rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {content.type === 'channel' && content.thumbnail && (
                      <img src={content.thumbnail} alt={content.name} className="w-8 h-8 rounded-full" />
                    )}
                    <span className="text-sm truncate text-secondary-foreground">
                      {content.type === 'channel' ? `Canal: ${content.name}` : `Vídeo: ${content.url}`}
                    </span>
                  </div>
                  <Button
                    onClick={() => removeContent(index)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <Button
          onClick={onSwitchToChild}
          className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80 w-full"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Modo Criança
        </Button>
      </div>
    </div>
  );
}