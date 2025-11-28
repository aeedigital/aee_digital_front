'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function LogoutPage() {
  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    Cookies.remove('userType');
    Cookies.remove('scope');
    setUser(null); // limpa contexto e localStorage
    router.replace('/login');
  }, [router, setUser]);

  return <p>Saindo...</p>;
}
