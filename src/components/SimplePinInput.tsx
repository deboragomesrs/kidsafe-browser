import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SimplePinInput({ length = 4, value, onChange, className }: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Garante que o valor não exceda o comprimento máximo
  const sanitizedValue = value.slice(0, length);
  const displayValue = Array.from({ length }, (_, i) => sanitizedValue[i] || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const input = e.target.value;
    
    // Aceita apenas o último dígito digitado e garante que seja um número
    const digit = input.replace(/\D/g, '').slice(-1);

    const newValueArray = displayValue;
    
    if (digit) {
      newValueArray[index] = digit;
      onChange(newValueArray.join(''));

      // Move o foco para o próximo input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (input === '') {
      // Permite apagar o dígito atual
      newValueArray[index] = '';
      onChange(newValueArray.join(''));
      
      // Se o campo foi esvaziado, move o foco para o anterior (para cobrir casos onde o backspace não é usado)
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      // Se o campo atual estiver vazio, move o foco para o anterior e deixa o handleChange lidar com a remoção do dígito
      if (displayValue[index] === '' && index > 0) {
        e.preventDefault(); // Previne o comportamento padrão do backspace no campo vazio
        inputRefs.current[index - 1]?.focus();
      }
      // Se o campo não estiver vazio, o handleChange já lida com a remoção do dígito e a movimentação do foco.
    }
  };

  return (
    <div className={cn("flex justify-center space-x-3", className)}>
      {displayValue.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="password" // Usando 'password' para esconder o PIN
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={cn(
            "w-12 h-12 text-center text-2xl font-bold",
            "rounded-xl border-2 border-border bg-input text-foreground",
            "focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none",
            "transition-all duration-200",
            "text-white" 
          )}
          // Removendo style={{ caretColor: 'transparent' }} para permitir que o usuário veja onde está digitando/apagando
        />
      ))}
    </div>
  );
}