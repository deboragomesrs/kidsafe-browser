# Regras de IA para a Aplicação Barra Kids

Este documento descreve as principais tecnologias utilizadas na aplicação Barra Kids e fornece diretrizes para o uso de bibliotecas, a fim de manter a consistência e as melhores práticas.

## Visão Geral da Pilha de Tecnologia

*   **Vite**: Uma ferramenta de build rápida que oferece um servidor de desenvolvimento instantâneo e builds otimizados para produção.
*   **TypeScript**: Um superconjunto de JavaScript que adiciona definições de tipo estático, melhorando a qualidade e a manutenibilidade do código.
*   **React**: Uma biblioteca JavaScript declarativa e baseada em componentes para a construção de interfaces de usuário.
*   **shadcn/ui**: Uma coleção de componentes de UI lindamente projetados, acessíveis e personalizáveis, construídos com Radix UI e Tailwind CSS.
*   **Tailwind CSS**: Um framework CSS utility-first para construir rapidamente designs personalizados diretamente em sua marcação.
*   **React Router**: Uma biblioteca padrão para roteamento em aplicações React, permitindo a navegação entre diferentes visualizações.
*   **TanStack React Query**: Uma biblioteca poderosa para gerenciar, armazenar em cache e sincronizar o estado do servidor em aplicações React.
*   **Lucide React**: Uma biblioteca que fornece um conjunto de ícones SVG bonitos e personalizáveis.
*   **Sonner**: Um componente de toast moderno para exibir notificações.
*   **Zod**: Uma biblioteca de declaração e validação de esquemas TypeScript-first, frequentemente usada com formulários.
*   **React Hook Form**: Uma biblioteca de formulários performática, flexível e extensível para React.

## Regras de Uso de Bibliotecas

Para garantir a consistência e aproveitar o ecossistema existente, por favor, siga as seguintes diretrizes ao desenvolver:

*   **Componentes de UI**: Sempre priorize os componentes `shadcn/ui` para construir a interface do usuário. Se um componente específico não estiver disponível ou exigir um desvio significativo do design do `shadcn/ui`, crie um novo componente, pequeno e focado, em `src/components/` usando Tailwind CSS.
*   **Estilização**: Toda a estilização deve ser feita usando classes **Tailwind CSS**. Evite escrever CSS personalizado, a menos que seja para estilos globais definidos em `src/index.css` ou classes de utilidade específicas.
*   **Roteamento**: Use `react-router-dom` para toda a navegação e gerenciamento de rotas do lado do cliente. Todas as rotas principais devem ser definidas em `src/App.tsx`.
*   **Gerenciamento de Estado e Busca de Dados**: Para gerenciar dados do lado do servidor e operações assíncronas complexas, utilize `TanStack React Query`. Para estados de componentes locais simples, `useState` e `useEffect` são apropriados.
*   **Manipulação de Formulários**: Use `react-hook-form` para gerenciar o estado do formulário, validação e submissão. Integre com `zod` para validação baseada em esquema.
*   **Ícones**: Todos os ícones devem ser obtidos da biblioteca `lucide-react`.
*   **Notificações Toast**: Use `sonner` para exibir todos os tipos de notificações ao usuário (sucesso, erro, informação, carregamento).
*   **Funções de Utilidade**: Utilize `clsx` e `tailwind-merge` (através da utilidade `cn` em `src/lib/utils.ts`) para aplicar e mesclar condicionalmente classes Tailwind CSS.
*   **Manipulação de Datas**: A biblioteca `date-fns` está disponível para quaisquer necessidades de formatação ou manipulação de datas.