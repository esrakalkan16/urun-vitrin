import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { attachSession } from '@/lib/auth';

// Basit kaba kuvvet koruması: IP başına 15 dakikada en fazla 10 hatalı deneme.
// Not: Sunucusuz ortamda her örnek kendi sayacını tutar; yine de otomatik denemeleri ciddi ölçüde yavaşlatır.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;
const failures = new Map<string, { count: number; first: number }>();

function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function isLocked(ip: string): boolean {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILS;
}

function recordFailure(ip: string) {
  const entry = failures.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) failures.set(ip, { count: 1, first: Date.now() });
  else entry.count++;
}

const invalid = () => NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (isLocked(ip)) {
    return NextResponse.json(
      { error: 'Çok fazla hatalı deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.' },
      { status: 429 },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const settings = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
  if (!settings?.adminPassword) {
    return NextResponse.json({ error: 'Sunucu yapılandırma hatası: yönetici hesabı tanımlı değil.' }, { status: 500 });
  }

  const emailOk = !email || email === settings.adminEmail.trim().toLowerCase();
  // E-posta yanlış olsa da bcrypt çalıştırılır; yanıt süresinden bilgi sızmasın
  const passwordOk = await bcrypt.compare(password, settings.adminPassword);

  if (!emailOk || !passwordOk) {
    recordFailure(ip);
    return invalid();
  }

  failures.delete(ip);
  const response = NextResponse.json({ ok: true });
  const ok = await attachSession(response, settings);
  if (!ok) {
    return NextResponse.json(
      { error: 'Sunucu yapılandırma hatası: SESSION_SECRET tanımlı değil.' },
      { status: 500 },
    );
  }
  return response;
}
