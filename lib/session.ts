// İmzalı yönetici oturumu. Yalnızca Web Crypto kullanır; hem proxy'de hem API route'larında çalışır.
//
// Çerez biçimi: base64url(JSON payload) + "." + base64url(HMAC-SHA256 imzası)
// payload = { exp: kesin bitiş (ms), idle: hareketsizlik bitişi (ms), fp: şifre parmak izi }
// fp, şifre (veya giriş e-postası) değiştiğinde eski oturumların geçersiz olmasını sağlar.
//
// Oturum üç yoldan biter:
// 1) Tarayıcı kapanınca: çerez maxAge'siz (oturum çerezi) verilir.
// 2) IDLE_TIMEOUT boyunca hiç işlem yapılmazsa (proxy her istekte idle'ı uzatır).
// 3) Girişten SESSION_MAX_AGE sonra, işlem yapılsa bile.

export const SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 saat
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 dakika

export type SessionPayload = { exp: number; idle: number; fp: string };

const encoder = new TextEncoder();
const DEV_FALLBACK_SECRET = 'dev-only-insecure-session-secret-change-me';

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === 'production') {
    console.error('[auth] SESSION_SECRET tanımlı değil ya da 32 karakterden kısa. Yönetici girişi kapalı.');
    return null;
  }
  return DEV_FALLBACK_SECRET;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array<ArrayBuffer> {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

/** Şifre hash'i + giriş e-postasından kısa bir parmak izi üretir. */
export async function credentialFingerprint(passwordHash: string, adminEmail: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${passwordHash}|${adminEmail.toLowerCase()}`));
  return toBase64Url(new Uint8Array(digest)).slice(0, 22);
}

/** Yeni oturum açar; `exp` verilirse (oturum yenileme) kesin bitiş korunur, yalnızca idle uzar. */
export async function createSessionToken(fp: string, exp?: number): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const now = Date.now();
  const end = exp ?? now + SESSION_MAX_AGE_MS;
  const payload: SessionPayload = { exp: end, idle: Math.min(now + IDLE_TIMEOUT_MS, end), fp };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await getKey(secret), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

/** İmza ve süre geçerliyse payload'u, değilse null döndürür. */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;

  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  try {
    // crypto.subtle.verify sabit zamanlı karşılaştırma yapar
    const ok = await crypto.subtle.verify('HMAC', await getKey(secret), fromBase64Url(sig), encoder.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (typeof payload.exp !== 'number' || typeof payload.idle !== 'number' || typeof payload.fp !== 'string') return null;
    const now = Date.now();
    if (payload.exp < now || payload.idle < now) return null;
    return payload;
  } catch {
    return null;
  }
}

// maxAge/expires yok: tarayıcı kapanınca çerez silinir.
// sameSite strict: başka sitelerden gelen isteklere çerez hiç eklenmez (CSRF koruması).
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};
