import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/helpers/buildApiUrl';

async function handleRequest(req: NextRequest, { params }: { params: { slug: string[] } }, method: string) {
  const apiUrl = buildApiUrl(req, params.slug);

  try {
    const options: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };

    if (method !== 'GET') {
      const body = await req.json();
      options.body = JSON.stringify(body);
    }

    const response = await fetch(apiUrl, options);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to ${method} to the external API` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error (${method}):`, error);
    return NextResponse.json(
      { error: `Error ${method.toLowerCase()}ing to external API`, details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * GET: recupera dados da API externa
 */
export async function GET(req: NextRequest, context: { params: { slug: string[] } }) {
  return handleRequest(req, context, 'GET');
}

/**
 * POST: envia dados para a API externa
 */
export async function POST(req: NextRequest, context: { params: { slug: string[] } }) {
  return handleRequest(req, context, 'POST');
}

/**
 * PUT: atualiza dados na API externa
 */
export async function PUT(req: NextRequest, context: { params: { slug: string[] } }) {
  return handleRequest(req, context, 'PUT');
}

/**
 * PATCH: atualiza parcialmente um recurso na API externa
 */
export async function PATCH(req: NextRequest, context: { params: { slug: string[] } }) {
  return handleRequest(req, context, 'PATCH');
}