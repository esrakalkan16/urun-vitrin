import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json(
      { error: 'Kategori adı gerekli' },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: { name: body.name },
  });

  return NextResponse.json(category, { status: 201 });
}