import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import PinSetup from "@/components/PinSetup";
import PinDialog from "@/components/PinDialog";
import ParentalSettingsContent from "@/components/ParentalSettingsContent";
import { Loader2 } from "lucide-react";

interface Props {
  onSwitchToChild: () => void;
}

// O estado isAuthenticated é mantido aqui, mas será resetado quando o usuário sair.
export default function ParentPanel({ onSwitchToChild }: Props) {
  const { profile, isLoading: profileLoading } = useProfile();
  // Este estado deve ser resetado sempre que o componente for montado/desmontado
  // ou quando o usuário sair do modo pai.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleExit = () => {
    // Garante que o estado de autenticação seja resetado para que o PIN seja solicitado novamente
    // na próxima vez que o usuário entrar no modo pai.
    setIsAuthenticated(false);
    onSwitchToChild();
  };

  if (profileLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Caso 1: O usuário tem um PIN, mas ainda não o digitou nesta sessão.
  if (profile && profile.parental_pin && !isAuthenticated) {
    return (
      <PinDialog
        open={true}
        onClose={handleExit} // Se o usuário fechar o diálogo, volta para o modo criança.
        correctPin={profile.parental_pin}
        onSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  // Caso 2: O usuário não tem um PIN. Mostra a tela de configuração.
  if (!profile || !profile.parental_pin) {
    // Se o usuário fechar o PinSetup (clicar no botão de voltar), ele deve sair do modo pai.
    return <PinSetup onExit={handleExit} />;
  }

  // Caso 3: O usuário tem um PIN e já o digitou com sucesso. Mostra o painel de configurações.
  return <ParentalSettingsContent onSwitchToChild={handleExit} />;
}