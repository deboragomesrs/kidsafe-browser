import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  onSwitchToParent: () => void;
}

export default function MainLayout({ children, onSwitchToParent }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <Header onSwitchToParent={onSwitchToParent} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background"> {/* Changed to bg-background (white) */}
          {children}
        </main>
      </div>
    </div>
  );
}