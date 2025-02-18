import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from "@/app/helpers/buildApiUrl";
import { createRandomPass } from '@/app/helpers/createRandonPass';

export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
    const apiUrl = buildApiUrl(req, [`passes/${params.slug[0]}`]);
  
    console.log("RECEBEU", apiUrl)
    
    if (req.method !== "POST") {

        return NextResponse.json(
            { error: 'Erro ao redefinir a senha', details: 'Método não permitido' },
            { status: 405 }
          );
      }
    
      try {
        // Gerando a senha com a biblioteca generate-password
        const newPassword = createRandomPass(6);
    
        // Simulação de atualização no banco de dados (substituir pelo seu código real)
        console.log("Nova senha gerada:", newPassword);

        const body = JSON.stringify({ pass: newPassword });

        const options = {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body).toString() // Adiciona o Content-Length manualmente
          },
          body
        };
        
        console.log("CALL OPTIONS", options)

        fetch(apiUrl, options)
          .then(response => response.json())
          .then(response => console.log(response))
          .catch(err => console.error(err));
    
        return NextResponse.json({ message: "Senha redefinida com sucesso", newPassword });

      } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao redefinir a senha', details: error?.message },
            { status: 500 }
          );
      }

}