import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import barraKidsLogo from "@/assets/barra-kids-logo.jpeg";

const LoginPage = () => {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src={barraKidsLogo} alt="Barra Kids Logo" className="mx-auto mb-4 w-24 h-24" />
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo ao Barra Kids</h1>
          <p className="text-muted-foreground">Faça login para continuar</p>
        </div>
        <div className="card-kids p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary) / 0.8)',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputText: 'hsl(var(--foreground))',
                  }
                }
              }
            }}
            providers={['google']}
            theme="dark"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Seu email',
                  password_label: 'Sua senha',
                  button_label: 'Entrar',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                    email_label: 'Seu email',
                    password_label: 'Sua senha',
                    button_label: 'Registrar',
                    social_provider_text: 'Registrar com {{provider}}',
                    link_text: 'Não tem uma conta? Registre-se',
                },
                forgotten_password: {
                    email_label: 'Seu email',
                    button_label: 'Enviar instruções',
                    link_text: 'Esqueceu sua senha?',
                }
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;