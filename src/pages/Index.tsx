import { useState } from "react";
import { useLocation } from "react-router-dom";
import ChildView from "@/components/ChildView";
import ParentPanel from "@/components/ParentPanel";
import LoginDialog from "@/components/LoginDialog";
import MainLayout from "@/components/layout/MainLayout";
import ChannelPage from "./Channel";

const Index = () => {
  const [isParentMode, setIsParentMode] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const location = useLocation();

  const isChannelPage = location.pathname.startsWith('/channel/');

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

  const renderContent = () => {
    if (isParentMode) {
      return <ParentPanel onSwitchToChild={handleSwitchToChild} />;
    }
    if (isChannelPage) {
      return <ChannelPage />;
    }
    return <ChildView />;
  };

  return (
    <>
      <MainLayout onSwitchToParent={handleSwitchToParent}>
        {renderContent()}
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