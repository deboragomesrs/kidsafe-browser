import { useState, useEffect } from "react";
import lionMascot from "@/assets/lion-mascot.png";
import SafeBrowser from "./SafeBrowser";

export default function ChildView() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showWelcome) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[hsl(var(--kids-blue))] to-[hsl(var(--kids-blue-dark))] p-8 animate-fade-in">
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
    <div className="w-full h-full flex flex-col">
      <SafeBrowser />
    </div>
  );
}