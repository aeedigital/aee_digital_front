
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";


import "./globals.css"; // Certifique-se de que o caminho esteja correto
import UserMenuComponent from "@/components/UserMenuComponent";


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
      <body className="bg-gray-50 dark:bg-gray-900">
      <Providers>

        <header className="flex items-center justify-between p-4 bg-white shadow dark:bg-gray-800">
          {/* Logo */}
          <Link href="/">

          <div id="logo" className="flex items-center">
            <Image
              src="/logo-aee2-vetor.png"
              width={300}
              height={80}
              alt="Logo"
              className="h-auto w-auto"
            />
        <h2 className="text-4xl font-bold" style={{ color: '#63A9BF' }}> Aliança Digital </h2>
        </div>
        </Link>
          {/* User Profile Section */}
          <div className="relative flex items-center">
            <UserMenuComponent />
          </div>
        </header>

        <main className="p-4">
          {children}
        </main>

        <Toaster />
        </Providers>
      </body>
    </html>
  );
}
