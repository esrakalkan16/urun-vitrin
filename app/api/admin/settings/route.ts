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

  let settings = await prisma.siteSetting.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    const defaultHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || '123456E', 12);
    settings = await prisma.siteSetting.create({
      data: {
        id: 'default',
        adminEmail: 'admin@vitrin.com',
        adminPassword: defaultHash,
        phone: '0555 555 55 55',
        whatsapp: '905555555555',
        email: 'info@vitrin.com',
        address: 'İstanbul, Türkiye',
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { adminPassword, ...safeSettings } = settings;
  return NextResponse.json(safeSettings);
}

// PUT /api/admin/settings -> Admin e-posta, şifre ve iletişim bilgilerini günceller
export async function PUT(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const body = await request.json();
  const validation = settingsSchema.safeParse(body);

  if (!validation.success) {
    const errorMessage = validation.error.issues.map((e) => e.message).join(', ');
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { adminEmail, adminPassword, phone, whatsapp, email, address } = validation.data;

  let hashedPassword: string | undefined = undefined;
  if (adminPassword && adminPassword.trim() !== '') {
    hashedPassword = await bcrypt.hash(adminPassword, 12);
  }

  const updated = await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {
      ...(adminEmail !== undefined && { adminEmail }),
      ...(hashedPassword !== undefined && { adminPassword: hashedPassword }),
      ...(phone !== undefined && { phone }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
    },
    create: {
      id: 'default',
      adminEmail: adminEmail || 'admin@vitrin.com',
      adminPassword: hashedPassword || (await bcrypt.hash(process.env.ADMIN_PASSWORD || '123456E', 12)),
      phone: phone || '0555 555 55 55',
      whatsapp: whatsapp || '905555555555',
      email: email || 'info@vitrin.com',
      address: address || 'İstanbul, Türkiye',
    },
  });

  const { adminPassword: newHash, ...safeUpdated } = updated;
  const response = NextResponse.json(safeUpdated);
  // Şifre/e-posta değiştiyse eski oturumlar geçersiz olur; bu kullanıcıya yeni oturum verilir.
  await attachSession(response, { adminPassword: newHash, adminEmail: updated.adminEmail });
  return response;
}
