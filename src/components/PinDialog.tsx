import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SimplePinInput from "./SimplePinInput";

interface Props {
  open: boolean;
  correctPin: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PinDialog({ open, correctPin, onClose, onSuccess }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (pin === correctPin) {
      setError("");
      onSuccess();
      setPin("");
      toast.success("Acesso liberado!");
    } else {
      setError("PIN incorreto! Tente novamente.");
      setPin("");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Impede o recarregamento da página
    if (pin.length === 4) {
      handleSubmit();
    }
  };

  const handlePinChange = (newPin: string) => {
    setPin(newPin);
    if (error) {
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-foreground border-border" translate="no">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Lock className="w-5 h-5" />
            Acesso ao Painel dos Pais
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Digite o seu PIN de 4 dígitos para continuar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="flex flex-col items-center gap-4 py-4">
          <SimplePinInput 
            length={4} 
            value={pin} 
            onChange={handlePinChange}
            className={cn({ "animate-shake": !!error })}
          />
          
          {error && (
            <p className="text-sm font-semibold text-destructive">{error}</p>
          )}

          <Button
            type="submit" // Alterado para 'submit' para funcionar com o formulário
            className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80 w-full mt-2"
            disabled={pin.length < 4}
          >
            Entrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}