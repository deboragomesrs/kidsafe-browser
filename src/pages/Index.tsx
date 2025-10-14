import ChildView from "@/components/ChildView";
import ParentPanel from "@/components/ParentPanel";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const isParentMode = !!user;

  if (isParentMode) {
    return <ParentPanel />;
  }

  return <ChildView />;
};

export default Index;