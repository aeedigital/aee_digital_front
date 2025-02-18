import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from "@/app/helpers/buildApiUrl";
import { createRandomPass } from '@/app/helpers/createRandonPass';
import { getRandomFakeName } from '@/app/helpers/getRandomFakeName';

export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
    const apiUrl = buildApiUrl(req, [`passes/${params.slug[0]}`]);

    const userId = params.slug[0];

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "centros";
    const nameParam = scope == "centro" ? "NOME_CENTRO" : "NOME_REGIONAL";

    if (req.method !== "POST") {

        return NextResponse.json(
            { error: 'Erro ao redefinir a senha', details: 'Método não permitido' },
            { status: 405 }
        );
    }

    try {
        let options = {};
        let newUser, newPassword;

        if(userId) {
            const pass = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passes/${userId}`).then((res) => res.json());
        const {scope_id} = pass;
        const scopeInfo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${scope}/${scope_id}`).then((res) => res.json());  

        const name = scopeInfo?.[nameParam] || "Centro";
        // Gerando a senha com a biblioteca generate-password
        newUser = getRandomFakeName(name);
        newPassword = createRandomPass(6);

        // Simulação de atualização no banco de dados (substituir pelo seu código real)
        const body = JSON.stringify({ user: newUser, pass: newPassword });

        options = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body).toString() // Adiciona o Content-Length manualmente
            },
            body
        };

        console.log("CALL OPTIONS", options)
        }else{
            // Obtendo o parâmetro 'name' da query string
            const scope_id = searchParams.get("scope_id") || "";

            const scoptInfo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${scope}/${scope_id}`).then((res) => res.json());  
    
            const name = scoptInfo?.[nameParam] || "Centro";
            // Gerando a senha com a biblioteca generate-password
            newUser = getRandomFakeName(name);
            newPassword = createRandomPass(6);
    
            let group=""

            switch (scope) {
                case "centros":
                    group="presidente"
                    break;
                case "regionais":
                    group="coord_regional"
                    break;
                default:
                    break;
            }
                

            const body = JSON.stringify({
                "user": newUser,
                "pass": newPassword,
                "scope_id": scope_id,
                "groups":[
                    group
                ]
            });

    
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body).toString() // Adiciona o Content-Length manualmente
                },
                body
            };
    
            console.log("CALL OPTIONS", options)

        }

        fetch(apiUrl, options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));

        return NextResponse.json({ message: "Senha redefinida com sucesso", newUser, newPassword });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao redefinir a senha', details: error?.message },
            { status: 500 }
        );
    }

}