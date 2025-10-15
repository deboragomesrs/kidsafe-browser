import { Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Sidebar() {
  const navItems = [
    {
      name: "Início",
      icon: Home,
      path: "/",
    },
  ];

  return (
    <aside className="flex flex-col items-center w-16 md:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border py-4 transition-all duration-300">
      <TooltipProvider>
        <nav className="flex flex-col gap-4 mt-4">
          {navItems.map((item) => (
            <Tooltip key={item.name} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-center md:justify-start gap-3 h-12 w-12 md:h-auto md:w-full md:px-3 md:py-2 rounded-lg transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground"
                    )
                  }
                >
                  <item.icon className="w-6 h-6 md:w-5 md:h-5" />
                  <span className="font-medium hidden md:inline">{item.name}</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}