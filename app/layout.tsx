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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none">
                  <Avatar className="w-10 h-10 cursor-pointer">
                    {/* <AvatarImage src="/path-to-user-image.jpg" alt="User Avatar" /> */}
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700" sideOffset={4} align="end">
                <DropdownMenuItem>
                  <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Início</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogoutButton></LogoutButton>
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
