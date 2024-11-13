'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import { Auth } from '../actions/auth';
import { getInitialPage } from '../actions/permitions';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Verifica se o componente foi montado
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true); // Garante que a UI só seja renderizada no cliente
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const auth = await Auth(username, password);
      if (auth) {
        const { role, scope } = auth;
        Cookies.set('userType', role);

        if(scope){
          Cookies.set('scope', scope);
        }

        const initialPage = getInitialPage(role, scope);
        if(!initialPage){
          throw new Error("Página não encontrada")
        }
        router.push(initialPage);
      } else {
        alert('Credenciais inválidas');
      }
    }catch(error){
      alert('Credenciais inválidas');
    } 
    
    finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null; // Evita renderização incorreta no SSR

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            disabled={isLoading}
            className="w-full"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={isLoading}
            className="w-full"
          />
        </CardContent>

        <CardFooter className="flex flex-col items-center space-y-2">
          <Button onClick={handleLogin} disabled={isLoading} className="w-full">
            {isLoading ? 'Carregando...' : 'Login'}
          </Button>
          <p className="text-sm text-gray-500">
            Não tem uma conta?{' '}
            <a href="/register" className="text-blue-500 hover:underline">
              Cadastre-se
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
