// /app/api/logout/route.ts
import { NextResponse } from 'next/server';
import Cookies from 'js-cookie';

export async function POST() {
  Cookies.remove('userType');
  Cookies.remove('scope');
  
  return NextResponse.redirect('/login');
}
