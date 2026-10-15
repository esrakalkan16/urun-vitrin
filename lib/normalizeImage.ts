import sharp from 'sharp';

// Ürün fotoğraflarını vitrinde eşit görünecek hale getirir:
// stüdyo zeminindeki boş kenarlar kırpılır, kıyafet kare bir tuvalin ortasına
// her fotoğrafta aynı doluluk oranıyla yerleştirilir. Böylece fotoğrafçı ürünü
// uzaktan çekmiş olsa da kartlarda küçük görünmez.

const MAX_SIZE = 1600; // px, çıktı karesinin en büyük kenarı
const FILL = 0.86; // ürünün kare içinde kaplayacağı oran
const EDGE = 22; // bu güçten zayıf kenarlar (zemin geçişi, vinyet, JPEG gürültüsü) yok sayılır
const MIN_SHARE = 0.006; // bir satır/sütunun ürün sayılması için gereken kenar pikseli oranı
const MARGIN = 0.04; // bulunan sınırın etrafına bırakılan pay; kenar erimesi bu payın içinde kalır

export type NormalizedImage = { buffer: Buffer; fillBefore: number };

export async function normalizeProductImage(input: Buffer | ArrayBuffer): Promise<NormalizedImage> {
  const oriented = await sharp(Buffer.from(input as ArrayBuffer))
    .rotate() // EXIF yönünü uygula
    .removeAlpha()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = oriented.info;

  const box = await contentBox(oriented.data, width, height);
  const fillBefore = Math.max(box.width / width, box.height / height);

  // Ürünü FILL oranında kaplayacak kare boyut; düşük çözünürlüklü üründe büyütme bulanıklaştırmasın diye
  // kare, ürünün kendi boyutundan türetilir ve MAX_SIZE ile sınırlanır.
  const side = Math.min(MAX_SIZE, Math.round(Math.max(box.width, box.height) / FILL));
  const scale = (side * FILL) / Math.max(box.width, box.height);
  const w = Math.min(side, Math.round(box.width * scale));
  const h = Math.min(side, Math.round(box.height * scale));

  const product = await sharp(oriented.data).extract(box).resize(w, h, { kernel: 'lanczos3' }).toBuffer();

  // Boşluk, ürünün hemen çevresindeki zemin tonuyla doldurulur; fotoğrafın kenarları bu tona
  // yumuşakça erir. Fotoğrafın kendi kenarına dayanan tarafta (pay yok) erime yapılmaz ki ürün solmasın.
  const background = await borderColor(product, w, h);
  // Erime payın yarısında biter (bulanıklık ±feather yayılır), ürünün kendisine ulaşmaz
  const feather = Math.max(2, Math.round(Math.max(w, h) * MARGIN * 0.45));
  const fade = {
    left: box.left > 0,
    top: box.top > 0,
    right: box.left + box.width < width,
    bottom: box.top + box.height < height,
  };
  const mask = await featherMask(w, h, feather, fade);

  const left = Math.floor((side - w) / 2);
  const top = Math.floor((side - h) / 2);
  const buffer = await sharp({ create: { width: side, height: side, channels: 3, background } })
    .composite([{ input: await sharp(product).joinChannel(mask).png().toBuffer(), left, top }])
    .webp({ quality: 86 })
    .toBuffer();

  return { buffer, fillBefore };
}

/**
 * Ürünün sınır kutusu. Stüdyo zemini köşelere doğru koyulaşır (vinyet), bu yüzden renk farkına
 * değil kenarlara bakılır: zemin geçişi yumuşaktır, kıyafet/askı keskin kenar üretir.
 */
async function contentBox(data: Buffer, W: number, H: number) {
  const { data: px, info } = await sharp(data)
    .resize(500, 500, { fit: 'inside' }) // hız için küçük kopyada ara
    .greyscale()
    .blur(0.8)
    .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  const rows = new Array<number>(h).fill(0);
  const cols = new Array<number>(w).fill(0);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (px[y * w + x] > EDGE) {
        rows[y]++;
        cols[x]++;
      }
    }
  }
  const first = (a: number[], n: number) => a.findIndex((c) => c > n * MIN_SHARE);
  const last = (a: number[], n: number) => a.length - 1 - [...a].reverse().findIndex((c) => c > n * MIN_SHARE);

  const top = first(rows, w);
  const left = first(cols, h);
  if (top < 0 || left < 0) return { left: 0, top: 0, width: W, height: H }; // ürün bulunamadı: dokunma
  const bottom = last(rows, w);
  const right = last(cols, h);

  const sx = W / w;
  const sy = H / h;
  const pad = Math.round(Math.max(W, H) * MARGIN);
  const x0 = Math.max(0, Math.floor(left * sx) - pad);
  const y0 = Math.max(0, Math.floor(top * sy) - pad);
  const x1 = Math.min(W, Math.ceil((right + 1) * sx) + pad);
  const y1 = Math.min(H, Math.ceil((bottom + 1) * sy) + pad);
  return { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
}

/** Görselin dış çerçevesindeki (yaklaşık %2'lik şerit) ortalama renk: ürünü saran zemin tonu. */
async function borderColor(img: Buffer, w: number, h: number) {
  const t = Math.max(2, Math.round(Math.min(w, h) * 0.02));
  const strips = [
    { left: 0, top: 0, width: w, height: t },
    { left: 0, top: h - t, width: w, height: t },
    { left: 0, top: 0, width: t, height: h },
    { left: w - t, top: 0, width: t, height: h },
  ];
  // stats() işlem hattını değil girdiyi ölçer: önce şeridi ayrı görsele çıkar, sonra ölç
  const stats = await Promise.all(
    strips.map(async (r) => sharp(await sharp(img).extract(r).toBuffer()).stats()),
  );
  const avg = (i: number) => Math.round(stats.reduce((s, st) => s + st.channels[i].mean, 0) / stats.length);
  return { r: avg(0), g: avg(1), b: avg(2) };
}

/** Kenarlara doğru şeffaflaşan tek kanallı maske; erime istenmeyen kenarlar tam opak kalır. */
async function featherMask(
  w: number,
  h: number,
  f: number,
  fade: { left: boolean; top: boolean; right: boolean; bottom: boolean },
) {
  // Erime olmayan tarafta dikdörtgen tuvalin dışına taşar, bulanıklık o kenarı etkilemez
  const x = fade.left ? f : -4 * f;
  const y = fade.top ? f : -4 * f;
  const x2 = fade.right ? w - f : w + 4 * f;
  const y2 = fade.bottom ? h - f : h + 4 * f;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="black"/>
    <rect x="${x}" y="${y}" width="${x2 - x}" height="${y2 - y}" fill="white"/>
  </svg>`;
  return sharp(Buffer.from(svg)).blur(f / 2).extractChannel(0).toBuffer();
}
