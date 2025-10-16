import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Props {
  onSwitchToChild: () => void;
}

export default function ParentPanel({ onSwitchToChild }: Props) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center">
      <div className="card-kids max-w-md w-full">
        <h1 className="text-2xl font-bold text-primary mb-4">Painel de Teste</h1>
        <p className="text-muted-foreground mb-6">
          Se você está vendo esta tela, o login com PIN funcionou!
        </p>
        <p className="mb-2">Logado como:</p>
        <p className="font-semibold break-all">{user.email}</p>
        
        <Button onClick={onSwitchToChild} className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80 w-full mt-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Modo Criança
        </Button>
      </div>
    </div>
  );
}