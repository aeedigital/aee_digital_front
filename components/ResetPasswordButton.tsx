"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useUser } from "@/context/UserContext";


export default function ResetPasswordButton() {

  const { user } = useUser();
  const { setUser } = useUser();

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isDialogOpen) {
      // Resetar a senha após o modal ser fechado
      setNewPassword("");
    }
  }, [isDialogOpen]);

  async function handleResetPassword() {
    setLoading(true);
    try {
      const response = await fetch(`/api/reset-password/${user?._id}`, {
        method: "POST"
      });


      if (!response.ok) {
        throw new Error("Erro ao redefinir a senha");
      }

      const data = await response.json();
      setNewPassword(data.newPassword);

      // Garante que o modal abre após a resposta da API
      setTimeout(() => setIsDialogOpen(true), 100);

      if (user) {
        setUser({
          _id: user?._id,
          user: user?.user,
          pass: data.newPassword,
          role: user?.role,
          scope: user?.scope,
        });
      }


    } catch (error: any) {
      toast({
        title: "Erro ao alterar a senha",
        description: error.message || "Não foi possível redefinir a senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault(); // Evita que o DropdownMenu feche antes da API responder
          handleResetPassword();
        }}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        disabled={loading}
      >
        {loading ? "Alterando..." : "Alterar Senha"}
      </button>

      {/* Modal de alerta para exibir as credenciais */}
      <AlertDialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Senha Alterada</AlertDialogTitle>
            <AlertDialogDescription>
              Suas novas credenciais foram geradas. Salve-as em um local seguro.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Login</label>
              <Input value={user?.user} readOnly className="cursor-default select-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</label>
              <Input value={newPassword} readOnly className="cursor-default select-all font-mono" />
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