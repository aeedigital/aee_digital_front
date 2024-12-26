// /app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const response = NextResponse.redirect('/login');
  response.headers.set(
    'Set-Cookie',
    serialize('userType', '', {
      maxAge: -1, // Expira o cookie
      path: '/',
    })
  );
  return response;
}
