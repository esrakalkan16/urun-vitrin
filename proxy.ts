import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

// /admin sayfalarını korur. Burada yalnızca imza ve süre kontrol edilir;
// şifre değişikliği sonrası geçersizleşme API tarafında (checkAuth) ayrıca denetlenir.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === '/admin/giris') {
    // Zaten giriş yapmışsa doğrudan panele gönder
    return session ? NextResponse.redirect(new URL('/admin/urunler', request.url)) : NextResponse.next();
  }

  if (!session) {
    const res = NextResponse.redirect(new URL('/admin/giris', request.url));
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
