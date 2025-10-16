import { useOutletContext } from "react-router-dom";
import ChildView from "@/components/ChildView";
import ParentPanel from "@/components/ParentPanel";
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
    isParentalFlowActive, 
    handleExitParentMode 
  } = useOutletContext<IndexContext>();
  
  if (authLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isParentalFlowActive) {
    return <ParentPanel onSwitchToChild={handleExitParentMode} />;
  }
  
  return <ChildView />;
}