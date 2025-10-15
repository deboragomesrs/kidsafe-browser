import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PinDialog from "@/components/PinDialog";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/use-profile";

export default function MainLayout() {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  
  const [isParentalFlowActive, setIsParentalFlowActive] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const handleEnterParentMode = () => {
    if (!user) return;
    
    if (profileLoading) return;

    if (profile && profile.parental_pin) {
      setShowPinDialog(true);
    } else {
      setIsParentalFlowActive(true);
    }
  };

  const handlePinSuccess = () => {
    setShowPinDialog(false);
    setIsParentalFlowActive(true);
  };

  const handleExitParentMode = () => {
    setIsParentalFlowActive(false);
  };

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
          onEnterParentMode={handleEnterParentMode}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
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