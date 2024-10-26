import type { Metadata } from "next";
import Link from "next/link";
import './globals.css'; // Verifique se o caminho está correto
import LogoutButton from "@/components/Logout";


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
        <nav>
          <ul>
            <li>
              <Link href='/'>Inicio</Link>
            </li>
            <li>
            <LogoutButton></LogoutButton>
            </li>
          </ul>
        </nav>

        <hr></hr>
        {children}
      </body>
      
    </html>
  );
}
