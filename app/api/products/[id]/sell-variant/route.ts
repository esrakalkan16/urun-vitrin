import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';

// POST /api/products/[id]/sell-variant
// Body: { variantId: string } -> Belirtilen yaştaki varyantın stok adedini 1 düşürür
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { variantId } = body;

  if (!variantId) {
    return NextResponse.json({ error: 'Varyant seçilmedi' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Stok düşürmeyi atomik updateMany ile yap (race condition olmaması için)
      const updateResult = await tx.productVariant.updateMany({
        where: {
          id: variantId,
          productId: id,
          quantity: { gt: 0 },
        },
        data: {
          quantity: { decrement: 1 },
        },
      });

      if (updateResult.count === 0) {
        // Varyant var mı kontrol et
        const existingVariant = await tx.productVariant.findFirst({
          where: { id: variantId, productId: id },
        });

        if (!existingVariant) {
          return { status: 404, error: 'Varyant bulunamadı' };
        }
        return { status: 409, error: 'Bu varyantın stoğu tükenmiştir' };
      }

      // Güncel varyant ve tüm varyant stoklarını al
      const updatedVariant = await tx.productVariant.findUnique({
        where: { id: variantId },
      });

      const allVariants = await tx.productVariant.findMany({
        where: { productId: id },
      });

      const totalRemainingStock = allVariants.reduce((sum, v) => sum + v.quantity, 0);

      let isArchived = false;
      if (totalRemainingStock === 0) {
        await tx.product.update({
          where: { id },
          data: { isActive: false },
        });
        isArchived = true;
      }

      return {
        status: 200,
        data: {
          ok: true,
          newQuantity: updatedVariant ? updatedVariant.quantity : 0,
          totalRemainingStock,
          isArchived,
        },
      };
    });

    if ('error' in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'İşlem gerçekleştirilemedi' }, { status: 500 });
  }
}
