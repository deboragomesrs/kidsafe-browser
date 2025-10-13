import { useLocation } from "react-router-dom";
import ChildView from "@/components/ChildView";
import ParentPanel from "@/components/ParentPanel";
import MainLayout from "@/components/layout/MainLayout";
import ChannelPage from "./Channel";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isChannelPage = location.pathname.startsWith('/channel/');
  const isParentMode = !!user;

  const handleSwitchToChild = () => {
    // This function is now effectively a logout, which is handled in the header.
    // We can keep the prop on ParentPanel for now, but it won't be connected to a complex state change here.
    // A better approach would be to have ParentPanel use the useAuth hook directly if it needs to logout.
    // For now, we'll just navigate home.
    window.location.href = '/';
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
    <MainLayout>
      {renderContent()}
    </MainLayout>
  );
};

export default Index;