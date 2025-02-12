"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { useUser } from "@/context/UserContext";

export default function ShowCurrentPasswordButton() {

    const { user } = useUser();

    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    async function fetchCurrentPassword(event: React.MouseEvent) {
        event.preventDefault();
        event.stopPropagation(); // Evita fechar o DropdownMenu

        try {
            setIsDialogOpen(true); // Abre o modal
        } catch (error: any) {
            toast({
                title: "Erro ao carregar a senha",
                description: error.message || "Não foi possível obter a senha.",
                variant: "destructive",
            });
        }
    }

    return (
        <>
            <button
                onClick={fetchCurrentPassword}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 w-full text-left"
            >
                Ver Senha Atual
            </button>

            {/* Modal para exibir a senha atual */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sua Senha Atual</AlertDialogTitle>
                        <AlertDialogDescription>
                            Aqui estão suas credenciais. Guarde-as em um local seguro.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Login</label>
                            <Input value={user?.user} readOnly className="cursor-default select-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha Atual</label>
                            <Input value={user?.pass} readOnly className="cursor-default select-all font-mono" />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <Button onClick={() => setIsDialogOpen(false)}>Fechar</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}