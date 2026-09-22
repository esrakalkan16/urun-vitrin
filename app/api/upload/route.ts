import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: 'file alanı gerekli' },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Sadece JPEG, PNG veya WebP görsel yüklenebilir' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `Dosya boyutu ${MAX_SIZE_MB}MB'ı geçemez` },
      { status: 400 }
    );
  }

  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return NextResponse.json(blob, { status: 201 });
}