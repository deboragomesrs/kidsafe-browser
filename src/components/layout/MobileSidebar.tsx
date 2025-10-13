import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Menu, Video } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import barraKidsLogo from "@/assets/barra-kids-logo.jpeg";

export default function MobileSidebar() {
  const navItems = [
    {
      name: "Início",
      icon: Home,
      path: "/",
    },
    // Adicione mais itens de navegação aqui, se necessário
    // {
    //   name: "Meus Vídeos",
    //   icon: Video,
    //   path: "/my-videos",
    // },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground border-r-sidebar-border">
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center gap-3">
              <img src={barraKidsLogo} alt="Barra Kids Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-sidebar-foreground">Barra Kids</span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}