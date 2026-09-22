import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products -> ürünleri listeler, ?category= ile filtrelenebilir
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category
        ? { variants: { some: { category: { name: category } } } }
        : {}),
    },
    include: {
      images: true,
      variants: {
        where: category
          ? { category: { name: category } } // Sadece filtrelenen varyantı getirir
          : {},
        include: { category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}

// POST /api/products -> yeni ürün oluşturur (admin)
export async function POST(request: Request) {
  const body = await request.json();

  const { title, description, price, images, variants } = body;

  if (!title || !price || !variants || variants.length === 0) {
    return NextResponse.json(
      { error: 'title, price ve en az bir variant (kategori + adet) zorunludur' },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      images: {
        create: (images ?? []).map((img: { url: string; isCover?: boolean }) => ({
          url: img.url,
          isCover: img.isCover ?? false,
        })),
      },
      variants: {
        create: variants.map((v: { categoryId: string; quantity: number }) => ({
          categoryId: v.categoryId,
          quantity: v.quantity,
        })),
      },
    },
    include: {
      images: true,
      variants: { include: { category: true } },
    },
  });

  return NextResponse.json(product, { status: 201 });
}