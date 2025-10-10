import { useState } from "react";
import ChildView from "@/components/ChildView";
import ParentPanel from "@/components/ParentPanel";
import LoginDialog from "@/components/LoginDialog";

const Index = () => {
  const [isParentMode, setIsParentMode] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleSwitchToParent = () => {
    setShowLoginDialog(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    setIsParentMode(true);
  };

  const handleSwitchToChild = () => {
    setIsParentMode(false);
  };

  return (
    <>
      {!isParentMode ? (
        <ChildView onSwitchToParent={handleSwitchToParent} />
      ) : (
        <ParentPanel onSwitchToChild={handleSwitchToChild} />
      )}
      
      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Index;
