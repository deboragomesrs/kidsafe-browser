import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  correctPin: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PinDialog({ open, correctPin, onClose, onSuccess }: Props) {
  const [pin, setPin] = useState("");

  const handleSubmit = () => {
    if (pin === correctPin) {
      onSuccess();
      setPin("");
      toast.success("Acesso liberado!");
    } else {
      toast.error("PIN incorreto!");
      setPin("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Acesso ao Painel dos Pais
          </DialogTitle>
          <DialogDescription>
            Digite o seu PIN de 4 dígitos para continuar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <InputOTP maxLength={4} value={pin} onChange={setPin}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            type="button"
            onClick={handleSubmit}
            className="btn-kids bg-primary text-primary-foreground hover:bg-primary/80 w-full"
            disabled={pin.length < 4}
          >
            Entrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}