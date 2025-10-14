import HomeView from "./HomeView";

interface Props {
  onEnterParentMode?: () => void;
}

export default function ChildView({ onEnterParentMode }: Props) {
  // O cabeçalho agora é global no MainLayout, então não precisamos mais do onEnterParentMode aqui diretamente,
  // mas a estrutura está pronta se precisarmos de um botão dentro desta view no futuro.
  return (
    <div className="w-full h-full flex flex-col">
      <HomeView />
    </div>
  );
}