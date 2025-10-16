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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const input = e.target.value;
    
    // Aceita apenas o último dígito digitado e garante que seja um número
    const digit = input.replace(/\D/g, '').slice(-1);

    const newValueArray = sanitizedValue.split('');
    
    if (digit) {
      newValueArray[index] = digit;
      onChange(newValueArray.join(''));

      // Move o foco para o próximo input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (input === '') {
      // Permite apagar
      newValueArray[index] = '';
      onChange(newValueArray.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && sanitizedValue[index] === '' && index > 0) {
      // Move o foco para o input anterior ao apagar
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Preenche os inputs com o valor atual
  const displayValue = Array.from({ length }, (_, i) => sanitizedValue[i] || '');

  return (
    <div className={cn("flex justify-center space-x-3", className)}>
      {displayValue.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="tel" // Usando tel para teclado numérico em mobile
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
            // Adicionando uma classe de cor de texto mais forte para garantir que seja branco
            "text-white" 
          )}
          style={{ caretColor: 'transparent' }} // Esconde o cursor
        />
      ))}
    </div>
  );
}