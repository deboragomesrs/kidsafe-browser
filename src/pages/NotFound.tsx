import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("Erro 404: Usuário tentou acessar rota inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-4 text-2xl">Oops! Página não encontrada</p>
        <p className="mb-8 text-muted-foreground">A página que você está procurando não existe ou foi movida.</p>
        <a href="/" className="text-primary underline hover:text-primary/80">
          Voltar para a Página Inicial
        </a>
      </div>
    </div>
  );
};

export default NotFound;