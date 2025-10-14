import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import PinDialog from "@/components/PinDialog";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/use-profile";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  
  // Este estado agora controla se o "fluxo parental" está ativo (seja para setup ou para gerenciar)
  const [isParentalFlowActive, setIsParentalFlowActive] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const handleEnterParentMode = () => {
    if (!user) return;
    
    // Se o perfil ainda está carregando, não faz nada para evitar estados inconsistentes
    if (profileLoading) return;

    if (profile && profile.parental_pin) {
      // Se já tem PIN, abre o diálogo para digitar
      setShowPinDialog(true);
    } else {
      // Se NÃO tem PIN, ativa o fluxo parental, que vai levar direto para a tela de setup
      setIsParentalFlowActive(true);
    }
  };

  const handlePinSuccess = () => {
    setShowPinDialog(false);
    // Após o PIN correto, ativa o fluxo parental
    setIsParentalFlowActive(true);
  };

  const handleExitParentMode = () => {
    // Desativa o fluxo parental e volta para a visão da criança
    setIsParentalFlowActive(false);
  };

  // Passa o estado e as funções para as páginas filhas (Index, etc.) através do Outlet
  const contextValue = {
    user,
    authLoading,
    profile,
    profileLoading,
    isParentalFlowActive,
    handleExitParentMode,
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          onEnterParentMode={handleEnterParentMode}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 overflow-y-auto">
            <Outlet context={contextValue} />
          </main>
        </div>
      </div>
      <PinDialog
        open={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        correctPin={profile?.parental_pin || ""}
        onSuccess={handlePinSuccess}
      />
    </>
  );
}