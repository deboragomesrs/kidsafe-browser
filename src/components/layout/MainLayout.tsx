import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import { Outlet, useOutletContext } from "react-router-dom";
import { useState } from "react";

type ContextType = { onEnterParentMode: () => void };

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // A lógica para entrar no modo parental agora é controlada pela página Index.
  // Precisamos de uma forma de passar o gatilho do Header para a página.
  // No entanto, a página Index não é um filho direto do Outlet aqui.
  // A melhor abordagem é ter a lógica na própria página Index e passar o callback para o Header.
  // Como Index não está aqui, vou deixar a lógica de estado no Index e o Header vai precisar de um jeito de chamar a função.
  // A forma mais limpa é usar um contexto ou um gerenciador de estado, mas para simplificar, vou assumir que a página Index renderiza o Header com o prop correto.
  // ... Reavaliando... A estrutura com Outlet é fixa. A página Index é renderizada DENTRO do Outlet.
  // A melhor forma é o Index passar um callback para o Outlet.
  
  const context = useOutletContext<ContextType>();

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        onEnterParentMode={context?.onEnterParentMode}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ onEnterParentMode: context?.onEnterParentMode }} />
        </main>
      </div>
    </div>
  );
}

export function useParentMode() {
  return useOutletContext<ContextType>();
}