import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions, verifySessionToken } from '@/lib/session';

// /admin sayfalarını korur ve her istekte oturumun hareketsizlik süresini uzatır.
// Burada yalnızca imza ve süre kontrol edilir; şifre değişikliği sonrası geçersizleşme
// API tarafında (checkAuth) ayrıca denetlenir.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  // API: yetki kontrolünü route'lar yapar; burada yalnızca geçerli oturumu tazeleriz.
  if (pathname.startsWith('/api/')) {
    // Giriş, çıkış ve ayar kaydı çerezi kendisi yazar; üstüne yazmayalım.
    const setsOwnCookie = pathname.startsWith('/api/admin/') && request.method !== 'GET';
    if (!token || setsOwnCookie) return NextResponse.next();
    const res = NextResponse.next();
    if (session) await refresh(res, session.fp, session.exp);
    else res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (pathname === '/admin/giris') {
    // Zaten giriş yapmışsa doğrudan panele gönder
    return session ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next();
  }

  if (!session) {
    const res = NextResponse.redirect(new URL('/admin/giris', request.url));
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  const res = NextResponse.next();
  // Panel sayfaları tarayıcı önbelleğinden (geri tuşu) oturumsuz gösterilmesin
  res.headers.set('Cache-Control', 'no-store');
  await refresh(res, session.fp, session.exp);
  return res;
}

async function refresh(res: NextResponse, fp: string, exp: number) {
  const next = await createSessionToken(fp, exp);
  if (next) res.cookies.set(SESSION_COOKIE, next, sessionCookieOptions);
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
