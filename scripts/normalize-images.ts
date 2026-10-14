// Mevcut ürün fotoğraflarını yeni yüklemelerle aynı biçime getirir:
// boş kenarlar kırpılır, ürün kare tuvalde sabit oranda ortalanır (lib/normalizeImage.ts).
//
// Kullanım:
//   npx tsx --env-file=.env scripts/normalize-images.ts            -> yalnızca rapor, hiçbir şey değişmez
//   npx tsx --env-file=.env scripts/normalize-images.ts --uygula   -> yeni görselleri yükler, veritabanını günceller
//
// Eski görseller SİLİNMEZ; geri almak için yazdırılan eşleşme listesi (eski -> yeni) yeterlidir.
// Daha önce işlenmiş görseller (urunler/ klasöründe, .webp) atlanır; script tekrar çalıştırılabilir.

import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import fs from 'node:fs';
import { normalizeProductImage } from '../lib/normalizeImage';

const prisma = new PrismaClient();
const apply = process.argv.includes('--uygula');

function alreadyNormalized(url: string) {
  return /\/urunler\/[^/]+\.webp$/.test(new URL(url).pathname);
}

async function main() {
  const images = await prisma.productImage.findMany({
    select: { id: true, url: true, product: { select: { title: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const log: { id: string; product: string; old: string; new: string }[] = [];
  let skipped = 0;

  for (const img of images) {
    if (alreadyNormalized(img.url)) {
      skipped++;
      continue;
    }
    const res = await fetch(img.url);
    if (!res.ok) {
      console.warn(`! indirilemedi (${res.status}): ${img.product.title}`);
      continue;
    }
    const { buffer, fillBefore } = await normalizeProductImage(await res.arrayBuffer());
    const line = `${img.product.title} — ürünün önceki doluluk oranı %${Math.round(fillBefore * 100)}`;

    if (!apply) {
      console.log(`  ${line}`);
      continue;
    }

    const blob = await put(`urunler/${crypto.randomUUID()}.webp`, buffer, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: true,
    });
    await prisma.productImage.update({ where: { id: img.id }, data: { url: blob.url } });
    log.push({ id: img.id, product: img.product.title, old: img.url, new: blob.url });
    console.log(`✓ ${line}`);
  }

  console.log(`\n${images.length} görsel, ${skipped} tanesi zaten işlenmiş.`);
  if (!apply) {
    console.log('Bu bir ön izlemeydi. Uygulamak için --uygula ile çalıştırın.');
    return;
  }
  const file = `normalize-images-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(file, JSON.stringify(log, null, 2));
  console.log(`${log.length} görsel güncellendi. Eski -> yeni eşleşmeleri: ${file}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
