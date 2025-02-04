"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BotaoCopiar } from "@/components/BotaoCopiar";
import { BarraDeCompartilhamento } from "@/components/BarraCompartilhamento";


import { Centro, Regional } from "@/interfaces/centro.interface";
import { Pass } from "@/interfaces/auth.interface";

interface LoginSenha {
  scopeInfo: Centro | Regional;
  scope: string;
  user: string;
  pass: string;
}

export default function CredenciaisPage() {
  return (
    <Suspense fallback={<p>Carregando credenciais...</p>}>
      <CredenciaisContent />
    </Suspense>
  );
}

// Componente que faz a busca e renderiza a tabela
function CredenciaisContent() {
  const searchParams = useSearchParams();

  const [scopeInfo, setContextInfo] = useState<LoginSenha[]>([]);

  useEffect(() => {
    async function getPasses() {
      const passes = await fetch(`/api/passes`).then((res) => res.json());
      return passes;
    }

    async function buscaCredenciaisDosCentros(scopeId: string) {
      const centros = await fetch(`/api/regionais/${scopeId}/centros`).then((res) => res.json());
      const passes = await getPasses();

      const info = centros.map((centro: Centro) => {
        const pass = passes.find((p: Pass) => p.scope_id === centro._id);
        return {
          scope: "centro",
          scopeInfo: centro,
          user: pass?.user,
          pass: pass?.pass,
        };
      });

      setContextInfo(info);
    }

    async function buscaCredenciaisDasRegionais() {
      const regionais = await fetch(`/api/regionais`).then((res) => res.json());
      const passes = await getPasses();

      const info = regionais.map((regional: Regional) => {
        const pass = passes.find((p: Pass) => p.scope_id === regional._id);
        return {
          scope: "regional",
          scopeInfo: regional,
          user: pass?.user,
          pass: pass?.pass,
        };
      });

      setContextInfo(info);
    }

    const scopeId = searchParams.get("scope_id");
    const scope = searchParams.get("scope");

    if (scope === "regional") {
      buscaCredenciaisDasRegionais();
    } else if (scopeId) {
      buscaCredenciaisDosCentros(scopeId);
    }
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center w-full px-4 md:px-8 py-4">
      <Card className="w-full shadow-lg rounded-lg bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Credenciais</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tabela responsiva com overflow-x-auto */}
          <div className="overflow-x-auto w-full">
            <table className="min-w-full border border-gray-200 text-sm md:text-base">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 md:p-4 text-left text-gray-600 font-medium border-b border-gray-200">
                    Nome
                  </th>
                  <th className="p-2 md:p-4 text-left text-gray-600 font-medium border-b border-gray-200">
                    Login
                  </th>
                  <th className="p-2 md:p-4 text-left text-gray-600 font-medium border-b border-gray-200">
                    Senha
                  </th>
                  <th className="p-2 md:p-4 text-left text-gray-600 font-medium border-b border-gray-200">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {scopeInfo.map((info) => (
                  <tr key={(info.scopeInfo as any)?._id}>
                    <td className="p-2 md:p-4 border-b border-gray-200">
                      {info.scope === "centro"
                        ? (info.scopeInfo as Centro)?.NOME_CENTRO
                        : (info.scopeInfo as Regional)?.NOME_REGIONAL}
                    </td>
                    <td className="p-2 md:p-4 border-b border-gray-200">
                      {info.user}
                    </td>
                    <td className="p-2 md:p-4 border-b border-gray-200">
                      {info.pass}
                    </td>
                    <td className="p-2 md:p-4 border-b border-gray-200">
                      <BarraDeCompartilhamento  texto={`Olá! Seguem as credenciais para acesso:

    O site que tem que acessar é o seguinte : http://162.214.123.133:3000/

    Estamos trabalhando para melhorar a segurança e a experiência de uso, mas por enquanto, use as credenciais abaixo:

    • Login: ${info.user}
    • Senha: ${info.pass}

    Use-as com cuidado e não compartilhe com terceiros sem autorização.
    Qualquer dúvida, estamos aqui para te ajudar. Obrigado!`}
                      />
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