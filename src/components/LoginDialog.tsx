import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_PASSWORD = "1234"; // In production, use proper authentication

export default function LoginDialog({ open, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === DEFAULT_PASSWORD) {
      onSuccess();
      setPassword("");
      toast.success("Acesso liberado!");
    } else {
      toast.error("Senha incorreta!");
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-foreground"> {/* Usando bg-card e text-foreground */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Acesso ao Painel dos Pais
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="rounded-xl bg-input text-foreground border-border" {/* Usando cores do tema escuro */}
              autoFocus
            />
            <p className="text-sm text-muted-foreground mt-2">
              Senha padrão: 1234
            </p>
          </div>
          <Button
            type="submit"
            className="btn-kids bg-[hsl(var(--youtube-red))] text-white hover:bg-[hsl(var(--youtube-red-dark))] w-full"
          >
            Entrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}