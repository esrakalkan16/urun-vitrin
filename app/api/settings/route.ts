import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/settings -> Müşteri tarafına açık iletişim ve mağaza bilgileri
export async function GET() {
  // Yalnızca genel iletişim alanları okunur; yönetici bilgileri bu route'tan hiç çekilmez.
  // Kayıt yoksa burada oluşturulmaz: yönetici hesabı yalnızca scripts/seed-admin.ts ile kurulur.
  const settings = await prisma.siteSetting.findUnique({
    where: { id: 'default' },
    select: { phone: true, whatsapp: true, email: true, address: true },
  });

  return NextResponse.json(settings ?? { phone: '', whatsapp: '', email: '', address: '' });
}
