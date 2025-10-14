import { useOutletContext } from "react-router-dom";
import ChildView from "@/components/ChildView";
import ParentPanel from "@/components/ParentPanel";
import PinSetup from "@/components/PinSetup";
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";

interface IndexContext {
  user: User | null;
  authLoading: boolean;
  profile: Tables<'profiles'> | null;
  profileLoading: boolean;
  isParentalFlowActive: boolean;
  handleExitParentMode: () => void;
}

export default function Index() {
  const { 
    user, 
    authLoading, 
    profile, 
    profileLoading, 
    isParentalFlowActive, 
    handleExitParentMode 
  } = useOutletContext<IndexContext>();
  
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Se o fluxo parental foi ativado (pelo clique no cadeado ou por um PIN bem-sucedido)
  if (isParentalFlowActive) {
    // Verifica se o perfil existe e se o PIN está definido
    if (profile && profile.parental_pin) {
      // Se tem PIN, mostra o painel de gerenciamento
      return <ParentPanel onSwitchToChild={handleExitParentMode} />;
    } else {
      // Se não tem PIN, força a tela de configuração de PIN
      return <PinSetup />;
    }
  }
  
  // Se o fluxo parental não está ativo, mostra a visão da criança
  return <ChildView />;
}