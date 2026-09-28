import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  SESSION_COOKIE,
  createSessionToken,
  credentialFingerprint,
  sessionCookieOptions,
  verifySessionToken,
} from '@/lib/session';

/**
 * API route'larında yönetici oturumunu doğrular:
 * 1) çerez imzası ve süresi geçerli mi,
 * 2) oturum, veritabanındaki güncel şifre/e-posta ile mi açılmış (şifre değişince eski oturumlar düşer).
 */
export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const payload = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return false;

  const settings = await prisma.siteSetting.findUnique({
    where: { id: 'default' },
    select: { adminPassword: true, adminEmail: true },
  });
  if (!settings?.adminPassword) return false;

  const fp = await credentialFingerprint(settings.adminPassword, settings.adminEmail);
  return fp === payload.fp;
}

/** Verilen yanıta yeni bir oturum çerezi ekler. Sunucu yapılandırması eksikse false döner. */
export async function attachSession(
  response: NextResponse,
  creds: { adminPassword: string; adminEmail: string },
): Promise<boolean> {
  const token = await createSessionToken(await credentialFingerprint(creds.adminPassword, creds.adminEmail));
  if (!token) return false;
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  response.cookies.delete('admin_auth'); // eski, güvensiz çerez
  return true;
}
