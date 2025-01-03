'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import { getInitialPage } from '../actions/permitions';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {UserRole} from '../actions/permitions'

type Authorization = {
  role: UserRole;
  scope?: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function Auth(user: string, pass: string): Promise<Authorization>{
    
    const users: any[] = await fetch(`/api/passes?user=${user}&pass=${pass}`).then((res) => res.json());
   
    const userInfo = users[0];
    // const {groups: [role], scope_id: scope} = userInfo

    let role = userInfo?.groups[0];
    let scope
    
    if(userInfo?.scope_id != "*")
    {
        scope = userInfo?.scope_id
    }
    return {
        scope,
        role
    }
  }

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const auth = await Auth(username, password);
      if (auth) {
        const { role, scope } = auth;
        Cookies.set('userType', role);

        if (scope) {
          Cookies.set('scope', scope);
        }

        const initialPage = getInitialPage(role, scope);
        if (!initialPage) {
          throw new Error("Página não encontrada");
        }
        router.push(initialPage);
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      alert('Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto flex flex-wrap lg:flex-nowrap p-4">
        {/* Left Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start p-6 bg-white rounded-lg shadow-lg lg:mr-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">CADASTRO ANUAL AEE</h2>
          <h5 className="text-gray-700 leading-relaxed text-base">
            Seja bem-vindo à página de cadastro das casas espíritas filiadas à Aliança Espírita Evangélica!<br /><br />
            Com o usuário e senha de sua Casa Espírita recebida do seu coordenador regional, você poderá acessar a página do cadastro e atualizar os dados!<br /><br />
            Ficou com dúvidas? Entre em contato com o coordenador de sua regional, ou fale com a Secretaria da Aliança (<a href="mailto:alianca@alianca.org.br" className="text-blue-500 hover:underline">alianca@alianca.org.br</a> WhatsApp <b>11 3105-5894</b>).
          </h5>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold">Login</CardTitle>
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
      </div>
    </div>
  );
}