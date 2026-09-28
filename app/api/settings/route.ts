import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/settings -> Müşteri tarafına açık iletişim ve mağaza bilgileri
export async function GET() {
  let settings = await prisma.siteSetting.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    settings = await prisma.siteSetting.create({
      data: {
        id: 'default',
        adminEmail: 'admin@vitrin.com',
        adminPassword: await bcrypt.hash(process.env.ADMIN_PASSWORD || '123456E', 12),
        phone: '0555 555 55 55',
        whatsapp: '905555555555',
        email: 'info@vitrin.com',
        address: 'İstanbul, Türkiye',
      },
    });
  }

  // Hassas verileri hariç tutarak sadece genel iletişim verilerini döndür
  return NextResponse.json({
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
  });
}
