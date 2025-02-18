'use client';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import LogoutButton from "@/components/Logout";
import ResetPasswordButton from "@/components/ResetPasswordButton";
import ShowCurrentPasswordButton from "@/components/ShowCurrentPasswordButton";
import { useUser } from "@/context/UserContext";


export default function UserMenuComponent() {

    const {user, setUser} = useUser();

    return(
        <>
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
                <DropdownMenuItem asChild>
                  <ShowCurrentPasswordButton></ShowCurrentPasswordButton>
                </DropdownMenuItem>

                {user && (
                <DropdownMenuItem asChild>
                  <ResetPasswordButton user={user} callback={setUser}></ResetPasswordButton>
                </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <LogoutButton></LogoutButton>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}