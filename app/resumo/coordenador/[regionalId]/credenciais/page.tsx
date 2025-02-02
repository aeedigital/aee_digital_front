"use client";

import { useState, useEffect } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BotaoCompartilhar } from "@/components/BotaoCompartilharComponent";

import { Centro, Regional } from "@/interfaces/centro.interface";
import { Pass } from "@/interfaces/auth.interface";

interface LoginSenha {
    centro: Centro;
    login: string;
    senha: string;
    };

// Exemplo de busca — substitua com o que você usa (Prisma, fetch, etc.)

export default function CredenciaisPage({
    params,
}: {
    params: { regionalId: string };
}) {
    const { regionalId } = params;

    const [centrosInfo, setCentrosInfo] = useState<LoginSenha[]>([]);
    const [regional, setRegional] = useState<Regional>();
    
    
    useEffect(() => {
        async function buscaCredenciaisDosCentros() {
            // const centros = ;
            // setCentros(centros);
            const [regional, centros,passes] = await Promise.all([
                await fetch(`/api/regionais/${regionalId}`).then((res) => res.json()),
                await fetch(`/api/regionais/${regionalId}/centros`).then((res) => res.json()),
                await fetch(`/api/passes`).then((res) => res.json())
            ])

            const centrosInfo = centros.map((centro: Centro) => {
                const pass = passes.find((pass: Pass) => pass.scope_id === centro._id);
                return {
                    centro,
                    login: pass?.user,
                    senha: pass?.pass,
                };
            });

            setCentrosInfo(centrosInfo);
            setRegional(regional);

        }


        buscaCredenciaisDosCentros();

        console.log("regionalId", regionalId);
  }, [regionalId]);


  return (
    <div className="flex justify-center items-center w-full p-4">
      <Card className="w-full shadow-lg rounded-lg bg-white border border-gray-200">
        <CardHeader>
          <CardTitle>Credenciais dos Centros</CardTitle>
          <p className="text-sm text-gray-500">
            Regional: <span className="font-medium">{regional?.NOME_REGIONAL}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium border-b border-gray-200">
                    Nome do Centro
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium border-b border-gray-200">
                    Login
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium border-b border-gray-200">
                    Senha
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium border-b border-gray-200">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {centrosInfo.map((centrosInfo) => (
                  <tr key={centrosInfo.centro._id}>
                    <td className="px-4 py-2 border-b border-gray-200">
                      {centrosInfo.centro.NOME_CENTRO}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      {centrosInfo.login}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      {centrosInfo.senha}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      {/* Botão para compartilhar */}
                      <BotaoCompartilhar login={centrosInfo.login} senha={centrosInfo.senha} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}