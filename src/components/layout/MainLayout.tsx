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
  
  // Centralizing state management here
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  
  const [isParentPanelUnlocked, setIsParentPanelUnlocked] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const handleEnterParentMode = () => {
    if (!user) return; // Should not happen if button is visible, but good practice
    if (profile && profile.parental_pin) {
      setShowPinDialog(true);
    } else {
      // If no PIN is set, go directly to setup
      setIsParentPanelUnlocked(true);
    }
  };

  const handlePinSuccess = () => {
    setShowPinDialog(false);
    setIsParentPanelUnlocked(true);
  };

  const handleExitParentMode = () => {
    setIsParentPanelUnlocked(false);
  };

  const contextValue = {
    user,
    authLoading,
    profile,
    profileLoading,
    isParentPanelUnlocked,
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