import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ArrowLeft, Shield, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AllowedContent } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface YouTubeChannelSearchResult {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
}

const fetchAllowedContent = async (userId: string): Promise<AllowedContent[]> => {
  const { data, error } = await supabase.from('allowed_content').select('*').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data || [];
};

export default function ParentalSettingsContent({ onSwitchToChild }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeChannelSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: allowedContent = [], isLoading } = useQuery({
    queryKey: ['allowedContent', user?.id],
    queryFn: () => fetchAllowedContent(user!.id),
    enabled: !!user,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.info("Digite um nome de canal para buscar.");
      return;
    }
    setIsSearching(true);
    setSearchResults([]);
    try {
      const { data, error } = await supabase.functions.invoke('search-youtube-channels', {
        body: { query: searchQuery }
      });
      if (error) throw new Error(error.message);
      setSearchResults(data);
    } catch (error: any) {
      toast.error(`Erro na busca: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const addContentMutation = useMutation({
    mutationFn: async (channel: YouTubeChannelSearchResult) => {
      const newContent: Omit<AllowedContent, 'id' | 'created_at'> = {
        type: 'channel',
        content_id: channel.channelId,
        name: channel.title,
        url: `https://www.youtube.com/channel/${channel.channelId}`,
        thumbnail_url: channel.thumbnail,
        shorts_enabled: true,
        user_id: user!.id,
      };

      const { error: insertError } = await supabase.from('allowed_content').insert(newContent);
      if (insertError) throw new Error(insertError.message);
      return channel;
    },
    onSuccess: (data) => {
      toast.success(`Canal "${data.title}" adicionado!`);
      queryClient.invalidateQueries({ queryKey: ['allowedContent', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar canal: ${error.message}`);
    },
  });

  const removeContentMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const { error } = await supabase.from('allowed_content').delete().eq('id', contentId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Conteúdo removido.");
      queryClient.invalidateQueries({ queryKey: ['allowedContent', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  const toggleShortsMutation = useMutation({
    mutationFn: async (content: AllowedContent) => {
      const { error } = await supabase.from('allowed_content').update({ shorts_enabled: !content.shorts_enabled }).eq('id', content.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Configuração de Shorts atualizada.");
      queryClient.invalidateQueries({ queryKey: ['allowedContent', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const isChannelAdded = (channelId: string) => {
    return allowedContent.some(c => c.content_id === channelId);
  };

  return (
    <div className="w-full h-full p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="card-kids mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Painel dos Pais</h1>
          </div>
          <p className="text-muted-foreground mb-6">Busque e adicione canais do YouTube que seus filhos podem assistir.</p>
          
          <div className="flex gap-2 mb-6">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o nome do canal para buscar..."
              className="flex-1 rounded-xl"
              disabled={isSearching}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching} className="btn-kids">
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
              Buscar
            </Button>
          </div>

          {isSearching && <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}

          {searchResults.length > 0 && (
            <div className="space-y-3 mb-8">
              <h2 className="text-xl font-semibold">Resultados da Busca</h2>
              {searchResults.map((channel) => (
                <div key={channel.channelId} className="flex items-center justify-between bg-secondary p-3 rounded-xl">
                  <div className="flex items-center gap-3 flex-1">
                    <img src={channel.thumbnail} alt={channel.title} className="w-10 h-10 rounded-full" />
                    <span className="text-sm font-medium break-all">{channel.title}</span>
                  </div>
                  <Button 
                    onClick={() => addContentMutation.mutate(channel)} 
                    disabled={addContentMutation.isPending || isChannelAdded(channel.channelId)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isChannelAdded(channel.channelId) ? 'Adicionado' : 'Adicionar'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-3">Conteúdo Permitido ({allowedContent.length})</h2>
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div> :
             allowedContent.length === 0 ? <p className="text-muted-foreground text-center py-8">Nenhum canal adicionado ainda.</p> :
             allowedContent.map((content) => (
              <div key={content.id} className="flex items-center justify-between bg-secondary p-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <img src={content.thumbnail_url || ''} alt={content.name || ''} className="w-10 h-10 rounded-full" />
                  <span className="text-sm font-medium break-all">{content.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`shorts-toggle-${content.id}`} className="text-xs text-muted-foreground">Shorts</Label>
                    <Switch
                      id={`shorts-toggle-${content.id}`}
                      checked={content.shorts_enabled}
                      onCheckedChange={() => toggleShortsMutation.mutate(content)}
                      disabled={toggleShortsMutation.isPending}
                    />
                  </div>
                  <Button onClick={() => removeContentMutation.mutate(content.id)} variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={removeContentMutation.isPending}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
             ))}
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