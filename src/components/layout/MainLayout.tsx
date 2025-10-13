import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  onSwitchToParent: () => void;
}

export default function MainLayout({ children, onSwitchToParent }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onSwitchToParent={onSwitchToParent} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}