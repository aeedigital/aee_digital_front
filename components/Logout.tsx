// /app/logout.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Faz a requisição para a API de logout
    await fetch('/api/logout', {
      method: 'POST',
    });
    // Redireciona para a página de login
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} className="menu-item logout">Logout</button>
  );
}
