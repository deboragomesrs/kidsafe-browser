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
  isParentPanelUnlocked: boolean;
  handleExitParentMode: () => void;
}

export default function Index() {
  const { 
    user, 
    authLoading, 
    profile, 
    profileLoading, 
    isParentPanelUnlocked, 
    handleExitParentMode 
  } = useOutletContext<IndexContext>();
  
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Se o usuário está logado
  if (user) {
    // Se o painel parental está desbloqueado (pelo PIN ou para setup)
    if (isParentPanelUnlocked) {
      // Se não tem PIN, mostra a tela de setup. Senão, o painel normal.
      return profile && !profile.parental_pin 
        ? <PinSetup /> 
        : <ParentPanel onSwitchToChild={handleExitParentMode} />;
    }
    
    // Se não, mostra a visão da criança
    return <ChildView />;
  }

  // Se não está logado, mostra a visão da criança
  return <ChildView />;
}