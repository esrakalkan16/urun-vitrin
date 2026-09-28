import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';

// Build sırasında sabitlenmesin; her istekte veritabanından güncel liste gelsin
export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const body = await request.json();
  const validation = categorySchema.safeParse(body);

  if (!validation.success) {
    const errorMessage = validation.error.issues.map((e) => e.message).join(', ');
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { name: validation.data.name },
  });

  return NextResponse.json(category, { status: 201 });
}