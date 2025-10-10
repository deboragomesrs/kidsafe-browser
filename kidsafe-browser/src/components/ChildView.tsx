import { useState, useEffect } from "react";
import barraKidsLogo from "@/assets/barra-kids-logo.jpeg"; // Importa o novo logo
import SafeBrowser from "./SafeBrowser";

export default function ChildView() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showWelcome) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black p-8 animate-fade-in"> {/* Fundo preto */}
        <img 
          src={barraKidsLogo} 
          alt="Barra Kids Logo" 
          className="w-64 h-auto mb-8 animate-bounce-slow"
        />
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-4">
          Bem-vindo ao BARRA KIDS!
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