import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  onSwitchToChild: () => void;
}

export default function ParentPanel({ onSwitchToChild }: Props) {
  const [allowedUrls, setAllowedUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("barraKidsAllowedUrls");
    if (saved) {
      try {
        setAllowedUrls(JSON.parse(saved));
      } catch {
        setAllowedUrls([]);
      }
    }
  }, []);

  const saveUrls = (urls: string[]) => {
    localStorage.setItem("barraKidsAllowedUrls", JSON.stringify(urls));
    setAllowedUrls(urls);
  };

  const addUrl = () => {
    if (!newUrl.trim()) {
      toast.error("Digite uma URL válida");
      return;
    }

    const updated = [...allowedUrls, newUrl.trim()];
    saveUrls(updated);
    setNewUrl("");
    toast.success("URL adicionada com sucesso!");
  };

  const removeUrl = (index: number) => {
    const updated = allowedUrls.filter((_, i) => i !== index);
    saveUrls(updated);
    toast.success("URL removida");
  };

  return (
    <div className="w-full h-full p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="card-kids mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-[hsl(var(--youtube-red))]" />
            <h1 className="text-3xl font-bold text-[hsl(var(--youtube-red))]">
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
              placeholder="Ex: youtube.com/watch?v=..."
              className="flex-1 rounded-xl"
              onKeyPress={(e) => e.key === "Enter" && addUrl()}
            />
            <Button
              onClick={addUrl}
              className="btn-kids bg-[hsl(var(--youtube-red))] text-white hover:bg-[hsl(var(--youtube-red-dark))]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-3">
              URLs Permitidas ({allowedUrls.length})
            </h2>
            {allowedUrls.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma URL adicionada ainda. Adicione URLs para seus filhos assistirem!
              </p>
            ) : (
              allowedUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm"
                >
                  <span className="text-sm break-all flex-1 mr-4">{url}</span>
                  <Button
                    onClick={() => removeUrl(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
          className="btn-kids bg-[hsl(var(--youtube-red))] text-white hover:bg-[hsl(var(--youtube-red-dark))] w-full"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Modo Criança
        </Button>
      </div>
    </div>
  );
}