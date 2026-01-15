
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import { Suspense } from "react";

import "./globals.css"; // Certifique-se de que o caminho esteja correto
import UserMenuComponent from "@/components/UserMenuComponent";
import { AuthGuard } from "@/components/AuthGuard";
import MainNav from "@/components/MainNav";


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
        <Suspense fallback={null}>
          <AuthGuard>
            <header className="flex items-center justify-between p-4 bg-white shadow dark:bg-gray-800">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3">
                  <div id="logo" className="flex items-center">
                    <Image
                      src="/logo-aee2-vetor.png"
                      width={220}
                      height={60}
                      alt="Logo"
                      className="h-auto w-auto"
                    />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: '#63A9BF' }}>
                    Aliança Digital
                  </h2>
                </Link>
                <MainNav />
              </div>

              <div className="relative flex items-center">
                <UserMenuComponent />
              </div>
            </header>

            <main className="p-4">
              {children}
            </main>
          </AuthGuard>
        </Suspense>

        <Toaster />
        </Providers>
      </body>
    </html>
  );
}
