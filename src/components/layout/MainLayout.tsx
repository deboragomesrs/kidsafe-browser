import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout() {
  const { user, loading: authLoading } = useAuth();
  const [isParentalFlowActive, setIsParentalFlowActive] = useState(false);
  const location = useLocation();

  const handleEnterParentMode = () => {
    // Apenas permite entrar no modo parental se estiver na página inicial
    if (location.pathname === "/") {
      setIsParentalFlowActive(true);
    }
  };

  const handleExitParentMode = () => {
    setIsParentalFlowActive(false);
  };

  const contextValue = {
    user,
    authLoading,
    isParentalFlowActive,
    handleExitParentMode,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header 
        onEnterParentMode={handleEnterParentMode}
        onExitParentMode={handleExitParentMode}
        isParentalFlowActive={isParentalFlowActive}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onExitParentMode={handleExitParentMode} />
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}