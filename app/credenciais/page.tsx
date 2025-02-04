"use client";

import { useState, useEffect, Suspense } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BotaoCopiar } from "@/components/BotaoCopiar";

import { Centro, Regional } from "@/interfaces/centro.interface";
import { Pass } from "@/interfaces/auth.interface";
import { useSearchParams } from "next/navigation";

interface LoginSenha {
  scopeInfo: Centro | Regional;
  scope: string;
  user: string;
  pass: string;
};


export default function CredenciaisPage() {
  return (
    <Suspense fallback={<p>Carregando credenciais...</p>}>
      <CredenciaisContent />
    </Suspense>
  );
}


// Exemplo de busca — substitua com o que você usa (Prisma, fetch, etc.)

function CredenciaisContent() {

  
  const searchParams = useSearchParams();


    const [scopeInfo, setContextInfo] = useState<LoginSenha[]>([]);
    
    useEffect(() => {

        async function  getPasses() {
          const passes = await fetch(`/api/passes`).then((res) => res.json());
          return passes;
        }

        async function buscaCredenciaisDosCentros() {
            const centros = await fetch(`/api/regionais/${scope_id}/centros`).then((res) => res.json());
            const passes = await getPasses();

            const info = centros.map((centro: Centro) => {
                const pass = passes.find((pass: Pass) => pass.scope_id === centro._id);
                return {
                  scope: "centro",
                  scopeInfo:centro,
                    user: pass?.user,
                    pass: pass?.pass,
                };
            });


            console.log("INFO", info)

            setContextInfo(info);
        }

        async function buscaCredenciaisDasRegionais() {
            const regionais = await fetch(`/api/regionais`).then((res) => res.json());
            const passes = await getPasses();

            const info = regionais.map((regional: Regional) => {
                const pass = passes.find((pass: Pass) => pass.scope_id === regional._id);
                return {
                  scope: "regional",
                    scopeInfo: regional,
                    user: pass?.user,
                    pass: pass?.pass,
                };
            });

            setContextInfo(info);
        }

        let scope_id = searchParams.get("scope_id");
        let scope = searchParams.get("scope");

        console.log(scope_id, scope);

        if(scope === "regional"){
            buscaCredenciaisDasRegionais();
        }else {
            buscaCredenciaisDosCentros();
        }

  }, []);


  return (
    <div className="flex justify-center items-center w-full p-4">
      <Card className="w-full shadow-lg rounded-lg bg-white border border-gray-200">
        <CardHeader>
          <CardTitle>Credenciais dos Centros</CardTitle>
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
                {scopeInfo.map((info) => (
                  <tr key={info.scopeInfo._id}>
                    <td className="px-4 py-2 border-b border-gray-200">
                      {info.scope === "centro" ? (info.scopeInfo as Centro)?.NOME_CENTRO : (info.scopeInfo as Regional)?.NOME_REGIONAL}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      {info.user}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      {info.pass}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      {/* Botão para compartilhar */}
                      <BotaoCopiar user={info.user} pass={info.pass} />
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