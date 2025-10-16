import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import PinSetup from "@/components/PinSetup";
import PinDialog from "@/components/PinDialog";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSwitchToChild: () => void;
}

export default function ParentPanel({ onSwitchToChild }: Props) {
  const { profile, isLoading: profileLoading } = useProfile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        onClose={onSwitchToChild} // Se o usuário fechar o diálogo, volta para o modo criança.
        correctPin={profile.parental_pin}
        onSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  // Caso 2: O usuário não tem um PIN. Mostra a tela de configuração.
  if (!profile || !profile.parental_pin) {
    return <PinSetup />;
  }

  // Caso 3: O usuário tem um PIN e já o digitou com sucesso. Mostra o painel.
  // (Usando a tela de diagnóstico por enquanto para confirmar)
  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center">
      <div className="card-kids max-w-md w-full">
        <h1 className="text-2xl font-bold text-primary mb-4">Diagnóstico bem-sucedido!</h1>
        <p className="text-muted-foreground mb-6">
          A transição para o modo parental funcionou. O problema da tela preta foi resolvido.
        </p>
        <Button onClick={onSwitchToChild} className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80 w-full mt-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Modo Criança
        </Button>
      </div>
    </div>
  );
}