// İmzalı yönetici oturumu. Yalnızca Web Crypto kullanır; hem proxy'de hem API route'larında çalışır.
//
// Çerez biçimi: base64url(JSON payload) + "." + base64url(HMAC-SHA256 imzası)
// payload = { exp: son geçerlilik (ms), fp: şifre parmak izi }
// fp, şifre (veya giriş e-postası) değiştiğinde eski oturumların geçersiz olmasını sağlar.

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 gün

type SessionPayload = { exp: number; fp: string };

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

export async function createSessionToken(fp: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const payload: SessionPayload = { exp: Date.now() + SESSION_MAX_AGE_SEC * 1000, fp };
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
    if (typeof payload.exp !== 'number' || typeof payload.fp !== 'string') return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_SEC,
};
