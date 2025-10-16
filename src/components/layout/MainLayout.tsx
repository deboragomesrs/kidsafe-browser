import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout() {
  const { user, loading: authLoading } = useAuth();
  const [isParentalFlowActive, setIsParentalFlowActive] = useState(false);

  const handleEnterParentMode = () => {
    setIsParentalFlowActive(true);
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
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}