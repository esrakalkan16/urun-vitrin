import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';
import { productUpdateSchema } from '@/lib/validations';
import { del } from '@vercel/blob';

// GET /api/products/[id] -> tek ürün
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { isCover: 'desc' } },
      variants: { include: { category: true }, orderBy: { category: { createdAt: 'asc' } } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /api/products/[id] -> ürün bilgilerini güncelle
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const validation = productUpdateSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage = validation.error.issues.map((e) => e.message).join(', ');
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { title, description, price, images, variants } = validation.data;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  }

  // Görseller güncelleniyorsa, kaldırılan görselleri Vercel Blob'dan sil
  if (images !== undefined) {
    const existingImages = await prisma.productImage.findMany({
      where: { productId: id },
    });

    const newImageUrls = new Set(images.map((img) => img.url));
    const imagesToDelete = existingImages.filter((img) => !newImageUrls.has(img.url));

    for (const img of imagesToDelete) {
      if (img.url.includes('blob.vercel-storage.com')) {
        try {
          await del(img.url);
        } catch (e) {
          console.error('Vercel Blob silme hatası:', e);
        }
      }
    }

    await prisma.productImage.deleteMany({ where: { productId: id } });
  }

  // Varyantları sil ve yeniden ekle
  if (variants !== undefined) {
    await prisma.productVariant.deleteMany({ where: { productId: id } });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(images !== undefined && {
        images: {
          create: images.map((img) => ({
            url: img.url,
            isCover: img.isCover ?? false,
          })),
        },
      }),
      ...(variants !== undefined && {
        variants: {
          create: variants.map((v) => ({
            categoryId: v.categoryId,
            quantity: v.quantity,
          })),
        },
      }),
    },
    include: {
      images: { orderBy: { isCover: 'desc' } },
      variants: { include: { category: true }, orderBy: { category: { createdAt: 'asc' } } },
    },
  });

  return NextResponse.json(updated);
}
