import { useNavigate } from "react-router-dom";
import ChildView from "@/components/ChildView";
import ParentPanel from "@/components/ParentPanel";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isParentMode = !!user;

  const handleSwitchToChild = () => {
    // A função de logout é tratada no header, então apenas navegamos para a home
    navigate("/");
  };

  if (isParentMode) {
    return <ParentPanel onSwitchToChild={handleSwitchToChild} />;
  }

  return <ChildView />;
};

export default Index;