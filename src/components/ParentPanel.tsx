import { useProfile } from "@/hooks/use-profile";
import PinSetup from "@/components/PinSetup";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSwitchToChild: () => void;
}

export default function ParentPanel({ onSwitchToChild }: Props) {
  const { profile, isLoading: profileLoading } = useProfile();

  if (profileLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Se o perfil existe e tem um PIN, mostramos o painel de verdade.
  // Por enquanto, usamos a tela de diagnóstico.
  if (profile && profile.parental_pin) {
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

  // Se não tem perfil ou não tem PIN, mostramos a tela de configuração.
  return <PinSetup />;
}