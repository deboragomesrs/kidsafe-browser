import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/context/AuthContext";
import SimplePinInput from "./SimplePinInput"; // Novo componente

export default function PinSetup() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const { user } = useAuth();
  const { updateProfile, isUpdating } = useProfile();

  const handleSetPin = () => {
    if (pin.length < 4) {
      toast.error("O PIN deve ter 4 dígitos.");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("Os PINs não coincidem.");
      return;
    }

    if (user) {
      updateProfile(
        { userId: user.id, updates: { parental_pin: pin } },
        {
          onSuccess: () => {
            toast.success("PIN definido com sucesso!");
          },
          onError: (error) => {
            toast.error(`Erro ao definir PIN: ${error.message}`);
          },
        }
      );
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="card-kids max-w-md w-full text-center" translate="no">
        <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Configure seu PIN Parental</h1>
        <p className="text-muted-foreground mb-8">
          Crie um PIN de 4 dígitos para proteger o acesso ao painel de controle.
        </p>

        <div className="space-y-6">
          <div>
            <label className="font-semibold mb-2 block">Novo PIN</label>
            <SimplePinInput length={4} value={pin} onChange={setPin} />
          </div>
          <div>
            <label className="font-semibold mb-2 block">Confirme o PIN</label>
            <SimplePinInput length={4} value={confirmPin} onChange={setConfirmPin} />
          </div>
        </div>

        <Button
          onClick={handleSetPin}
          disabled={isUpdating || pin.length < 4 || confirmPin.length < 4}
          className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80 w-full mt-8"
        >
          {isUpdating ? "Salvando..." : "Salvar PIN"}
        </Button>
      </div>
    </div>
  );
}