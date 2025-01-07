// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canAccessPage } from '@/app/actions/permitions';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

    const userType = request.cookies.get('userType')?.value || request.headers.get('user-type');

    if (userType != 'undefined') {

      const hasAccess = canAccessPage(userType as 'coord_geral' | 'coord_regional' | 'presidente', path);
      if (!hasAccess) {
        url.pathname = '/login'; // Redireciona para login ou página de acesso negado
        return NextResponse.redirect(url);
      }
    } else {
      url.pathname = '/login'; // Redireciona se o usuário não estiver autenticado
      return NextResponse.redirect(url);
    }

  return NextResponse.next();
}

// Aplicar o middleware apenas para rotas específicas
export const config = {
  matcher: [
    '/summary_alianca/:path*',
    '/summary_coord/:path*',
    '/'
  ],
};
