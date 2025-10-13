import { Lock, Search, Bell, Cast } from "lucide-react";
import { Button } from "@/components/ui/button";
import barraKidsLogo from "@/assets/barra-kids-logo.jpeg";
import MobileSidebar from "./MobileSidebar";
import { NavLink } from "react-router-dom";

interface HeaderProps {
  onSwitchToParent: () => void;
}

export default function Header({ onSwitchToParent }: HeaderProps) {
  return (
    <header className="bg-background text-white p-2 md:p-4 shadow-lg flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <MobileSidebar />
        <NavLink to="/" className="flex items-center gap-3">
          <img src={barraKidsLogo} alt="Barra Kids Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-bold hidden sm:block">Barra Kids</h1>
        </NavLink>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Cast className="w-5 h-5" />
        </Button>
        <Button
          onClick={onSwitchToParent}
          variant="ghost"
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors"
        >
          <Lock className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Pais</span>
        </Button>
      </div>
    </header>
  );
}