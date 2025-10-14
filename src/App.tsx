import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import ChannelPage from "./pages/Channel";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import { useState } from "react";

const queryClient = new QueryClient();

// Componente para gerenciar o estado que precisa ser compartilhado entre a página e o layout
const AppLayout = () => {
  const [isParentPanelUnlocked, setIsParentPanelUnlocked] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const contextValue = {
    isParentPanelUnlocked,
    setIsParentPanelUnlocked,
    showPinDialog,
    setShowPinDialog,
  };

  return (
    <MainLayout>
      <Outlet context={contextValue} />
    </MainLayout>
  );
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/channel/:channelId" element={<ChannelPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;