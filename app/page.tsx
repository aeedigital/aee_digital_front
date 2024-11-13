// /app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInitialPage } from './actions/permitions'
import { UserRole } from './actions/permitions';

import Cookies from 'js-cookie';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const userRole = Cookies.get('userType') as UserRole;
    const scope = Cookies.get('scope');

console.log("LOGIN", userRole)

    if (!userRole) {
      // Redireciona para a página de login se não estiver autenticado
      router.push('/login');
    } else {

      console.log("AQUI")
      // Redireciona para a página correspondente ao papel do usuário
      const redirectPage = getInitialPage(userRole, scope) || '/login';

console.log(redirectPage)

      router.push(redirectPage);
    }
  }, [router]);

  return (
    <div>
      <p>Redirecionando...</p>
    </div>
  );
}
