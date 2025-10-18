import { useOutletContext } from "react-router-dom";
import ChildView from "@/components/ChildView";
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface IndexContext {
  user: User | null;
  authLoading: boolean;
  isParentalFlowActive: boolean;
  handleExitParentMode: () => void;
}

export default function Index() {
  const { 
    authLoading, 
  } = useOutletContext<IndexContext>();
  
  if (authLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // O MainLayout agora lida com a renderização do ParentPanel
  return <ChildView />;
}