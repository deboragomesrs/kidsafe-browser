import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Shield, ArrowLeft, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AllowedContent } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { FunctionsHttpError } from "@supabase/supabase-js";

interface YouTubeChannelSearchResult {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeChannelSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [shortsEnabledForNew, setShortsEnabledForNew] = useState<Record<string, boolean>>({});

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allowedContent', user?.id] });
      toast.success(`Canal "${data?.[0]?.name}" adicionado!`);
      setSearchResults([]);
      setSearchQuery("");
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar canal: ${error.message}`);
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: Partial<AllowedContent> }) => {
      const { error } = await supabase.from('allowed_content').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allowedContent', user?.id] });
      toast.success(`Configuração de Shorts atualizada.`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    }
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const { data, error } = await supabase.functions.invoke('search-youtube-channels', {
        body: { query: searchQuery }
      });
      if (error) throw error;
      setSearchResults(data);
      // Default shorts to enabled for new search results
      setShortsEnabledForNew(data.reduce((acc: Record<string, boolean>, channel: YouTubeChannelSearchResult) => {
        acc[channel.channelId] = true;
        return acc;
      }, {}));
      if (data.length === 0) {
        toast.info("Nenhum canal encontrado com esse nome.");
      }
    } catch (error: any) {
      const errorMessage = error instanceof FunctionsHttpError ? (await error.context.json()).error : error.message;
      toast.error(`Erro na busca: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddChannel = (channel: YouTubeChannelSearchResult) => {
    addContentMutation.mutate({
      type: 'channel',
      content_id: channel.channelId,
      name: channel.title,
      thumbnail_url: channel.thumbnail,
      url: `https://www.youtube.com/channel/${channel.channelId}`,
      shorts_enabled: shortsEnabledForNew[channel.channelId] ?? true,
    });
  };

  return (
    <div className="w-full h-full p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="card-kids mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Painel dos Pais</h1>
          </div>
          <p className="text-muted-foreground mb-6">Busque pelo nome do canal do YouTube para adicioná-lo à lista de conteúdos permitidos.</p>
          <div className="flex gap-2 mb-6">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o nome do canal..."
              className="flex-1 rounded-xl bg-input text-foreground border-border"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              disabled={isSearching}
            />
            <Button onClick={handleSearch} className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80" disabled={isSearching}>
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
              Buscar
            </Button>
          </div>

          {isSearching && <div className="flex justify-center py-4"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}

          {searchResults.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-lg font-semibold">Resultados da Busca:</h3>
              {searchResults.map((channel) => (
                <div key={channel.channelId} className="flex items-center justify-between bg-secondary p-3 rounded-xl gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={channel.thumbnail} alt={channel.title} className="w-10 h-10 rounded-full" />
                    <p className="font-semibold truncate">{channel.title}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`shorts-${channel.channelId}`} 
                        checked={shortsEnabledForNew[channel.channelId]}
                        onCheckedChange={(checked) => setShortsEnabledForNew(prev => ({...prev, [channel.channelId]: !!checked}))}
                      />
                      <Label htmlFor={`shorts-${channel.channelId}`} className="text-xs">Liberar Shorts</Label>
                    </div>
                    <Button onClick={() => handleAddChannel(channel)} size="sm" className="bg-primary/20 text-primary hover:bg-primary/30">
                      <Plus className="w-4 h-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 mt-8">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Conteúdo Permitido ({allowedContent.length})</h2>
            {isLoadingContent ? <p>Carregando...</p> : allowedContent.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum conteúdo adicionado ainda.</p>
            ) : (
              allowedContent.map((content) => (
                <div key={content.id} className="flex items-center justify-between bg-secondary p-3 rounded-xl shadow-sm gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {content.thumbnail_url && <img src={content.thumbnail_url} alt={content.name || ""} className="w-8 h-8 rounded-full" />}
                    <span className="text-sm truncate text-secondary-foreground">{content.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {content.type === 'channel' && (
                       <div className="flex items-center space-x-2">
                         <Switch
                           id={`switch-shorts-${content.id}`}
                           checked={content.shorts_enabled}
                           onCheckedChange={(checked) => updateContentMutation.mutate({ id: content.id, updates: { shorts_enabled: checked }})}
                         />
                         <Label htmlFor={`switch-shorts-${content.id}`} className="text-xs">Shorts</Label>
                       </div>
                    )}
                    <Button onClick={() => removeContentMutation.mutate(content.id)} variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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