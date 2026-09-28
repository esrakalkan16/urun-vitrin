import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';
import { productSchema } from '@/lib/validations';

// GET /api/products -> ürünleri listeler
// ?category= ile filtrelenebilir
// ?all=true ile tüm ürünler (admin kullanımı için, isActive filtresi olmadan)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const all = searchParams.get('all') === 'true';

  if (all) {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
  }

  const products = await prisma.product.findMany({
    where: {
      ...(all ? {} : { isActive: true }),
      ...(category
        ? { variants: { some: { category: { name: category } } } }
        : {}),
    },
    include: {
      images: { orderBy: { isCover: 'desc' } },
      variants: {
        where: category
          ? { category: { name: category } }
          : {},
        include: { category: true },
        orderBy: { category: { createdAt: 'asc' } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}

// POST /api/products -> yeni ürün oluşturur (admin)
export async function POST(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const body = await request.json();
  const validation = productSchema.safeParse(body);

  if (!validation.success) {
    const errorMessage = validation.error.issues.map((e) => e.message).join(', ');
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { title, description, price, images, variants } = validation.data;

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      images: {
        create: (images ?? []).map((img) => ({
          url: img.url,
          isCover: img.isCover ?? false,
        })),
      },
      variants: {
        create: variants.map((v) => ({
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