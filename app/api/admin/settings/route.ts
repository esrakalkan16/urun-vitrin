import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { attachSession, checkAuth } from '@/lib/auth';
import { settingsSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/settings -> Admin profil ve ayarlarını getirir
export async function GET() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  // checkAuth kaydın varlığını zaten doğruladı; şifre hash'i hiç seçilmez.
  const settings = await prisma.siteSetting.findUnique({
    where: { id: 'default' },
    select: { adminEmail: true, phone: true, whatsapp: true, email: true, address: true },
  });
  return NextResponse.json(settings);
}

// PUT /api/admin/settings -> Admin e-posta, şifre ve iletişim bilgilerini günceller
export async function PUT(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validation = settingsSchema.safeParse(body);

  if (!validation.success) {
    const errorMessage = validation.error.issues.map((e) => e.message).join(', ');
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { adminEmail, adminPassword, currentPassword, phone, whatsapp, email, address } = validation.data;

  const current = await prisma.siteSetting.findUnique({
    where: { id: 'default' },
    select: { adminEmail: true, adminPassword: true },
  });
  if (!current) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  // Giriş e-postası ya da şifre değişecekse mevcut şifre doğrulanır;
  // böylece açık unutulmuş bir oturumu ele geçiren biri hesabı kendine alamaz.
  const changesPassword = !!adminPassword;
  const changesEmail =
    adminEmail !== undefined && adminEmail.trim().toLowerCase() !== current.adminEmail.trim().toLowerCase();
  if (changesPassword || changesEmail) {
    const ok = !!currentPassword && (await bcrypt.compare(currentPassword, current.adminPassword));
    if (!ok) {
      return NextResponse.json(
        { error: 'Giriş bilgilerini değiştirmek için mevcut şifrenizi doğru girin.' },
        { status: 403 },
      );
    }
  }

  const hashedPassword = adminPassword ? await bcrypt.hash(adminPassword, 12) : undefined;

  const updated = await prisma.siteSetting.update({
    where: { id: 'default' },
    data: {
      ...(changesEmail && adminEmail && { adminEmail: adminEmail.trim().toLowerCase() }),
      ...(hashedPassword !== undefined && { adminPassword: hashedPassword }),
      ...(phone !== undefined && { phone }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
    },
  });

  const { adminPassword: newHash, ...safeUpdated } = updated;
  const response = NextResponse.json(safeUpdated);
  // Şifre/e-posta değiştiyse eski oturumlar geçersiz olur; bu kullanıcıya yeni oturum verilir.
  await attachSession(response, { adminPassword: newHash, adminEmail: updated.adminEmail });
  return response;
}
