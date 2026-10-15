import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { normalizeProductImage } from '@/lib/normalizeImage';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!(file instanceof File)) {
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

  // Boş kenarları kırp, ürünü kare tuvalde sabit oranda ortala (vitrinde hepsi eşit görünsün).
  // Dosya ayrıca yeniden kodlandığı için içine gömülü olası zararlı veri/EXIF de atılmış olur.
  let image: Buffer;
  try {
    image = (await normalizeProductImage(await file.arrayBuffer())).buffer;
  } catch {
    return NextResponse.json({ error: 'Görsel okunamadı. Geçerli bir JPEG, PNG veya WebP yükleyin.' }, { status: 400 });
  }

  // İstemcinin gönderdiği dosya adı kullanılmaz (yol karakterleri, garip adlar)
  const blob = await put(`urunler/${crypto.randomUUID()}.webp`, image, {
    contentType: 'image/webp',
    access: 'public',
    addRandomSuffix: true,
  });

  return NextResponse.json(blob, { status: 201 });
}