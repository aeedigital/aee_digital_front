import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/helpers/buildApiUrl';

/**
 * GET: recupera dados da API externa
 */
export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const apiUrl = buildApiUrl(req, params.slug);

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from the external API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error (GET):", error);
    return NextResponse.json(
      { error: 'Error fetching from external API', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST: envia dados para a API externa
 */
export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const apiUrl = buildApiUrl(req, params.slug);

  try {
    // Extrair o body da requisição (caso seja JSON)
    const body = await req.json();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        // Ajuste conforme o tipo de dados que você estiver enviando
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to POST to the external API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error (POST):", error);
    return NextResponse.json(
      { error: 'Error posting to external API', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PUT: atualiza dados na API externa
 */
export async function PUT(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const apiUrl = buildApiUrl(req, params.slug);

  try {
    // Extrair o body da requisição (caso seja JSON)
    const body = await req.json();

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        // Ajuste conforme o tipo de dados que você estiver enviando
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to PUT to the external API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error (PUT):", error);
    return NextResponse.json(
      { error: 'Error putting to external API', details: error?.message },
      { status: 500 }
    );
  }
}
