import { NextRequest } from 'next/server';

// Função auxiliar para construir a URL externa
export function buildApiUrl(req: NextRequest, slug: string[]): string {
  const { searchParams } = new URL(req.url);
  const path = slug ? slug.join('/') : '';

  let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${path}`;
  if (searchParams.toString()) {
    apiUrl += `?${searchParams.toString()}`;
  }
  return apiUrl;
}
