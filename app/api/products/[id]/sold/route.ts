import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';

// POST /api/products/[id]/sold -> ürünü satıldı/aktif olarak işaretle
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const { id } = await params;
  let body: { isActive?: boolean } = {};
  try {
    body = await request.json();
  } catch {}

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) {
        return null;
      }

      const targetState = typeof body.isActive === 'boolean' ? body.isActive : !product.isActive;

      return await tx.product.update({
        where: { id },
        data: { isActive: targetState },
      });
    });

    if (!updated) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'İşlem gerçekleştirilemedi' }, { status: 500 });
  }
}
