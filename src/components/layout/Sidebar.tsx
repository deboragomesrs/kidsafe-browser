import { Home, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navItems = [
    {
      name: "Início",
      icon: Home,
      path: "/",
    },
  ];

  return (
    <aside 
      className={cn(
        "fixed md:sticky top-0 left-0 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4 z-40 transition-transform duration-300 hidden md:flex flex-col",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"
      )}
    >
      <div className="flex justify-end mb-4">
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="w-5 h-5" />
        </Button>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
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
    </aside>
  );
}