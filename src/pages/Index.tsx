import { useState } from "react";
import ChildView from "@/components/ChildView";
import ParentPanel from "@/components/ParentPanel";
import LoginDialog from "@/components/LoginDialog";
import MainLayout from "@/components/layout/MainLayout";

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
      <MainLayout onSwitchToParent={handleSwitchToParent}>
        {!isParentMode ? (
          <ChildView />
        ) : (
          <ParentPanel onSwitchToChild={handleSwitchToChild} />
        )}
      </MainLayout>
      
      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Index;