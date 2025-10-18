import { Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  onExitParentMode?: () => void;
}

export default function Sidebar({ onExitParentMode }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      name: "Início",
      icon: Home,
      path: "/",
    },
  ];

  const handleNavigateHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExitParentMode) {
      onExitParentMode();
    }
    navigate('/');
  };

  return (
    <aside className="hidden md:flex flex-col items-center w-16 py-4">
      <TooltipProvider>
        <nav className="flex flex-col gap-4 mt-4">
          {navItems.map((item) => (
            <Tooltip key={item.name} delayDuration={0}>
              <TooltipTrigger asChild>
                <a
                  href={item.path}
                  onClick={handleNavigateHome}
                  className={cn(
                    "flex items-center justify-center h-12 w-12 rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}