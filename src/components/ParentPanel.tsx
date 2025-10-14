import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AllowedContent } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { FunctionsHttpError } from "@supabase/supabase-js";

// Fetch allowed content for the user
const fetchAllowedContent = async (userId: string): Promise<AllowedContent[]> => {
  const { data, error } = await supabase
    .from('allowed_content')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

interface Props {
  onSwitchToChild: () => void;
}

export default function ParentPanel({ onSwitchToChild }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");

  const { data: allowedContent = [], isLoading: isLoadingContent } = useQuery({
    queryKey: ['allowedContent', user?.id],
    queryFn: () => fetchAllowedContent(user!.id),
    enabled: !!user,
  });

  const addContentMutation = useMutation({
    mutationFn: async (contentToAdd: Omit<AllowedContent, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from('allowed_content')
        .insert({ ...contentToAdd, user_id: user.id })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowedContent', user?.id] });
      setNewUrl("");
    },
  });

  const removeContentMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const { error } = await supabase.from('allowed_content').delete().eq('id', contentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowedContent', user?.id] });
      toast.success("Conteúdo removido");
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    }
  });

  const handleAddContent = async () => {
    if (!newUrl.trim() || addContentMutation.isPending) return;

    const url = newUrl.trim();
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);

    if (videoIdMatch) {
      // Lógica para vídeo (simplificada por enquanto)
      addContentMutation.mutate({
        type: 'video',
        url: url,
        content_id: videoIdMatch[1],
        name: `Vídeo: ${videoIdMatch[1]}`,
        thumbnail_url: `https://img.youtube.com/vi/${videoIdMatch[1]}/0.jpg`
      }, { onSuccess: () => toast.success("Vídeo adicionado!") });
    } else {
      // Lógica para canal
      try {
        toast.loading("Verificando canal...");
        const { data, error } = await supabase.functions.invoke('fetch-youtube-channel-videos', { body: { channelUrl: url } });
        toast.dismiss();

        if (error) throw error;
        if (!data || !data.channelId) throw new Error("Resposta inválida do servidor.");

        addContentMutation.mutate({
          type: 'channel',
          content_id: data.channelId,
          name: data.channelName,
          url: url,
          thumbnail_url: data.channelThumbnail
        }, { onSuccess: () => toast.success(`Canal "${data.channelName}" adicionado!`) });

      } catch (error: any) {
        toast.dismiss();
        let errorMessage = error instanceof FunctionsHttpError ? (await error.context.json()).error : error.message;
        toast.error(`Erro: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="card-kids mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Painel dos Pais</h1>
          </div>
          <p className="text-muted-foreground mb-6">Adicione URLs de canais ou vídeos do YouTube que seus filhos podem assistir.</p>
          <div className="flex gap-2 mb-6">
            <Input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Ex: youtube.com/@canal"
              className="flex-1 rounded-xl bg-input text-foreground border-border"
              onKeyPress={(e) => e.key === "Enter" && handleAddContent()}
              disabled={addContentMutation.isPending}
            />
            <Button onClick={handleAddContent} className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80" disabled={addContentMutation.isPending}>
              <Plus className="w-5 h-5 mr-2" />
              {addContentMutation.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Conteúdo Permitido ({allowedContent.length})</h2>
            {isLoadingContent ? <p>Carregando...</p> : allowedContent.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum conteúdo adicionado ainda.</p>
            ) : (
              allowedContent.map((content) => (
                <div key={content.id} className="flex items-center justify-between bg-secondary p-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {content.type === 'channel' && content.thumbnail_url && (
                      <img src={content.thumbnail_url} alt={content.name || ""} className="w-8 h-8 rounded-full" />
                    )}
                    <span className="text-sm truncate text-secondary-foreground">{content.name}</span>
                  </div>
                  <Button onClick={() => removeContentMutation.mutate(content.id)} variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
        <Button onClick={onSwitchToChild} className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80 w-full">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Modo Criança
        </Button>
      </div>
    </div>
  );
}