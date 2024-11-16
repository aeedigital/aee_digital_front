import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";


import "./globals.css"; // Certifique-se de que o caminho esteja correto
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
      <body className="bg-gray-50 dark:bg-gray-900">
        <header className="flex items-center justify-between p-4 bg-white shadow dark:bg-gray-800">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/logo-aee2-completo-vetor.png"
              width={150}
              height={40}
              alt="Logo"
              className="h-auto w-auto"
            />
          </div>

          {/* User Profile Section */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-10 h-10 cursor-pointer">
                  <AvatarImage src="/path-to-user-image.jpg" alt="User Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {/* <DropdownMenuItem>
                  <Link href="/profile" className="w-full">Perfil</Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem>
                  <LogoutButton></LogoutButton>
                  {/* <Link href="/logout" className="w-full">Sair</Link> */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4">
          {children}
        </main>

        <Toaster />
      </body>
    </html>
  );
}
