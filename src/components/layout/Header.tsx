import { Search, Bell, Cast, LogIn, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import barraKidsLogo from "@/assets/barra-kids-logo.jpeg";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, login, logout } = useAuth();

  return (
    <header className="bg-background text-white p-2 md:p-4 shadow-lg flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button onClick={onMenuClick} variant="ghost" size="icon">
          <Menu className="w-5 h-5" />
        </Button>
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
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.user_metadata.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={login}
            variant="ghost"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Login</span>
          </Button>
        )}
      </div>
    </header>
  );
}