// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = new URL(request.url);

  // Jika pengguna sudah login, redirect dari login/register ke dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika pengguna belum login, redirect ke login saat mencoba mengakses dashboard
  if (!token && pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/login', '/register'],
};