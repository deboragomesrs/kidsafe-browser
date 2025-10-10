import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import lionMascot from "@/assets/lion-mascot.png";
import SafeBrowser from "./SafeBrowser";

interface Props {
  onSwitchToParent: () => void;
}

export default function ChildView({ onSwitchToParent }: Props) {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showWelcome) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[hsl(var(--kids-blue))] to-[hsl(var(--kids-blue-dark))] p-8 animate-fade-in">
        <img 
          src={lionMascot} 
          alt="Leão mascote" 
          className="w-64 h-auto mb-8 animate-bounce-slow"
        />
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-4">
          Bem-vindo ao BARRA KIDS! 🦁
        </h1>
        <p className="text-xl md:text-2xl text-white/90 text-center max-w-2xl">
          Sua plataforma para assistir conteúdo seguro.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-[hsl(var(--kids-blue-light))]">
      <header className="bg-gradient-to-r from-[hsl(var(--kids-blue))] to-[hsl(var(--kids-blue-dark))] text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={lionMascot} alt="Leão" className="w-12 h-12 object-contain" />
            <h1 className="text-2xl font-bold">Barra Kids</h1>
          </div>
          <button
            onClick={onSwitchToParent}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <Lock className="w-5 h-5" />
            <span className="hidden sm:inline">Modo Pais</span>
          </button>
        </div>
      </header>
      
      <SafeBrowser />
    </div>
  );
}
