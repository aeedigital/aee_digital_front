import type { Metadata } from "next";
import Link from "next/link";
import './globals.css'; // Verifique se o caminho está correto
import LogoutButton from "@/components/Logout";
import Image from 'next/image'

import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Aliança Digital",
  description: "Site da Aliança Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px' }}>
          <div>
            <Image 
              src="/logo-aee2-completo-vetor.png"
              width={276}
              height={60}
              alt="Logo" />
          </div>
          <nav>
            <ul style={{ display: 'flex', gap: '15px', listStyleType: 'none', margin: 0, padding: 0 }}>
              <li>
                <Link href='/'>Inicio</Link>
              </li>
              <li>
                <LogoutButton></LogoutButton>
              </li>
            </ul>
          </nav>
        </div>
        
        <hr />
        {children}
        <Toaster />

      </body>
    </html>
  );
}
