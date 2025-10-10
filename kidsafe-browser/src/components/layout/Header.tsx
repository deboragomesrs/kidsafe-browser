import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import barraKidsLogo from "@/assets/barra-kids-logo.jpeg"; // Importa o novo logo

interface HeaderProps {
  onSwitchToParent: () => void;
}

export default function Header({ onSwitchToParent }: HeaderProps) {
  return (
    <header className="bg-background text-white p-4 shadow-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={barraKidsLogo} alt="Barra Kids Logo" className="w-10 h-10 object-contain" />
        <h1 className="text-xl font-bold">Barra Kids</h1>
      </div>
      <Button
        onClick={onSwitchToParent}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-300 text-white"
      >
        <Lock className="w-4 h-4" />
        <span className="hidden sm:inline">Modo Pais</span>
      </Button>
    </header>
  );
}