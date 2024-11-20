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
    <button onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Logout</button>
  );
}
