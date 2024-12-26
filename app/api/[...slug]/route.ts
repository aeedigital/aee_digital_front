import Error from 'next/error';
import { NextRequest, NextResponse } from 'next/server';

// Rota GET genérica que faz uma chamada para uma API externa
export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  // Capturando os parâmetros de consulta
  const { searchParams } = new URL(req.url);

  // Capturando os segmentos dinâmicos da URL (slug)
  const { slug } = params;
  const path = slug ? slug.join('/') : '';

  // Construindo a URL dinâmica para a chamada externa
  let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${path}`;

  // Adiciona os parâmetros de consulta à URL se houver algum
  if (searchParams.toString()) {
    apiUrl += `?${searchParams.toString()}`;
  }

  try {
    // Fazendo a chamada à API externa com múltiplos parâmetros de consulta
    const response = await fetch(apiUrl);

    // Verificando se a chamada foi bem-sucedida
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from the external API' }, { status: response.status });
    }

    // Obtendo os dados da resposta
    const data = await response.json();

    // Retornando a resposta da API externa
    return NextResponse.json(data);
  } catch (error:any) {

    console.log("error", error)
    // Capturando e retornando erros caso a requisição falhe
    return NextResponse.json({ error: 'Error fetching from external API', details: error?.message }, { status: 500 });
  }
}