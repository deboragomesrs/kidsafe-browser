import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import ChildView from "@/components/ChildView";
import ParentPanel from "@/components/ParentPanel";
import PinSetup from "@/components/PinSetup";
import PinDialog from "@/components/PinDialog";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  
  const [isParentPanelUnlocked, setIsParentPanelUnlocked] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  // Callback para o Header
  const handleEnterParentMode = () => {
    if (profile && profile.parental_pin) {
      setShowPinDialog(true);
    } else {
      // Se não tem PIN, força o modo parental para a tela de setup
      setIsParentPanelUnlocked(true);
    }
  };

  // Callback do PinDialog
  const handlePinSuccess = () => {
    setShowPinDialog(false);
    setIsParentPanelUnlocked(true);
  };

  // Callback do ParentPanel
  const handleExitParentMode = () => {
    setIsParentPanelUnlocked(false);
  };

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
    return (
      <>
        <ChildView onEnterParentMode={handleEnterParentMode} />
        <PinDialog
          open={showPinDialog}
          onClose={() => setShowPinDialog(false)}
          correctPin={profile?.parental_pin || ""}
          onSuccess={handlePinSuccess}
        />
      </>
    );
  }

  // Se não está logado, mostra a visão da criança (com conteúdo padrão ou vazio)
  return <ChildView />;
}