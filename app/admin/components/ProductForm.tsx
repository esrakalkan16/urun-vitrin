'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/lib/types';
import { IconClose, IconMinus, IconPlus } from '@/app/components/icons';

export type ProductFormImage = { url: string; isCover: boolean };

export type ProductFormValues = {
  title: string;
  description: string;
  price: string;
  images: ProductFormImage[];
  /** categoryId → adet */
  stock: Record<string, number>;
};

export type ProductPayload = {
  title: string;
  description?: string;
  price: number;
  images: ProductFormImage[];
  variants: { categoryId: string; quantity: number }[];
};

const emptyValues: ProductFormValues = { title: '', description: '', price: '', images: [], stock: {} };

function withCover(images: ProductFormImage[]): ProductFormImage[] {
  if (images.length === 0 || images.some((i) => i.isCover)) return images;
  return images.map((img, i) => ({ ...img, isCover: i === 0 }));
}

export function ProductForm({
  initial = emptyValues,
  submitLabel,
  onSubmit,
}: {
  initial?: ProductFormValues;
  submitLabel: string;
  /** Hata varsa mesajı döndürür, başarılıysa null */
  onSubmit: (payload: ProductPayload) => Promise<string | null>;
}) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(initial.price);
  const [images, setImages] = useState<ProductFormImage[]>(initial.images);
  const [stock, setStock] = useState<Record<string, number>>(initial.stock);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    const uploaded: ProductFormImage[] = [];
    let failed = 0;
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error();
        const blob = await res.json();
        uploaded.push({ url: blob.url, isCover: false });
      } catch {
        failed++;
      }
    }
    setImages((prev) => withCover([...prev, ...uploaded]));
    if (failed > 0) setError(`${failed} görsel yüklenemedi. Dosya boyutunu ve türünü kontrol edin.`);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  const setCover = (i: number) => setImages((prev) => prev.map((img, j) => ({ ...img, isCover: j === i })));
  const removeImage = (i: number) => setImages((prev) => withCover(prev.filter((_, j) => j !== i)));

  function toggle(catId: string) {
    setStock((prev) => {
      const next = { ...prev };
      if (next[catId] !== undefined) delete next[catId];
      else next[catId] = 1;
      return next;
    });
  }
  const setQty = (catId: string, qty: number) =>
    setStock((prev) => ({ ...prev, [catId]: Math.max(0, Math.min(999, qty)) }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const variants = Object.entries(stock)
      .filter(([, q]) => q > 0)
      .map(([categoryId, quantity]) => ({ categoryId, quantity }));

    if (!title.trim()) return setError('Ürün adı girin.');
    const priceNum = parseFloat(price.replace(',', '.'));
    if (!priceNum || priceNum <= 0) return setError('Geçerli bir fiyat girin.');
    if (variants.length === 0) return setError('En az bir yaş grubu seçip stok adedi girin.');

    setSaving(true);
    const err = await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      price: priceNum,
      images,
      variants,
    });
    if (err) {
      setError(err);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Temel bilgiler */}
      <section className="card space-y-5 p-5 md:p-7">
        <h2 className="text-base font-medium text-ink">Ürün bilgileri</h2>
        <div>
          <label htmlFor="title" className="label">
            Ürün adı
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn. Organik pamuk tulum"
            className="input"
            required
          />
        </div>
        <div className="sm:w-1/2">
          <label htmlFor="price" className="label">
            Fiyat
          </label>
          <div className="relative">
            <input
              id="price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ''))}
              placeholder="0"
              className="input pr-10"
              required
            />
            <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-muted">₺</span>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="label">
            Açıklama <span className="font-normal text-muted">(isteğe bağlı)</span>
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kumaş, kalıp, bakım önerileri…"
            className="input resize-y"
          />
        </div>
      </section>

      {/* Görseller */}
      <section className="card p-5 md:p-7">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-medium text-ink">Fotoğraflar</h2>
          <span className="text-sm text-muted">{images.length} fotoğraf</span>
        </div>
        <p className="hint mt-1">Kapak fotoğrafı vitrinde ilk görünen fotoğraftır. Değiştirmek için fotoğrafa dokunun.</p>

        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((img, i) => (
            <div key={img.url} className="relative">
              <button
                type="button"
                onClick={() => setCover(i)}
                aria-label={img.isCover ? 'Kapak fotoğrafı' : `Fotoğraf ${i + 1}: kapak yap`}
                aria-pressed={img.isCover}
                className={`relative block aspect-square w-full overflow-hidden rounded-lg bg-subtle ${
                  img.isCover ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''
                }`}
              >
                <Image src={img.url} alt="" fill sizes="160px" className="object-cover" />
                <span
                  className={`absolute inset-x-1.5 bottom-1.5 rounded-md py-1 text-center text-[11px] font-medium ${
                    img.isCover ? 'bg-ink text-white' : 'bg-surface/90 text-ink-soft'
                  }`}
                >
                  {img.isCover ? 'Kapak' : 'Kapak yap'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label={`Fotoğraf ${i + 1}: kaldır`}
                className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-sm hover:text-danger"
              >
                <IconClose className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line-strong text-sm text-muted transition-colors hover:border-ink-soft hover:text-ink disabled:opacity-60"
          >
            {uploading ? (
              'Yükleniyor…'
            ) : (
              <>
                <IconPlus className="h-5 w-5" />
                Fotoğraf ekle
              </>
            )}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </section>

      {/* Yaş grupları ve stok */}
      <section className="card p-5 md:p-7">
        <h2 className="text-base font-medium text-ink">Yaş grupları ve stok</h2>
        <p className="hint mt-1">Ürünün bulunduğu yaş gruplarını seçip her biri için adet girin.</p>

        {categories === null ? (
          <div className="mt-4 space-y-2" aria-hidden="true">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
        ) : categories.length === 0 ? (
          <p className="mt-4 rounded-lg bg-subtle px-4 py-3 text-sm text-ink-soft">
            Henüz yaş grubu yok.{' '}
            <Link href="/admin/kategoriler" className="font-medium text-ink underline underline-offset-4">
              Kategoriler
            </Link>{' '}
            sayfasından ekleyin.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
            {categories.map((cat) => {
              const selected = stock[cat.id] !== undefined;
              const qty = stock[cat.id] ?? 0;
              return (
                <li key={cat.id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm select-none">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggle(cat.id)}
                      className="h-4 w-4 accent-ink"
                    />
                    <span className={selected ? 'text-ink' : 'text-ink-soft'}>{cat.name}</span>
                  </label>

                  {selected && (
                    <div className="flex items-center rounded-full border border-line-strong">
                      <button
                        type="button"
                        onClick={() => setQty(cat.id, qty - 1)}
                        disabled={qty <= 0}
                        aria-label={`${cat.name}: adet azalt`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-subtle disabled:opacity-40"
                      >
                        <IconMinus className="h-4 w-4" />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => setQty(cat.id, parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                        aria-label={`${cat.name}: adet`}
                        className="w-10 bg-transparent text-center text-sm font-medium text-ink focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(cat.id, qty + 1)}
                        aria-label={`${cat.name}: adet artır`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-subtle"
                      >
                        <IconPlus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Kaydet çubuğu */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur-md md:mx-0 md:rounded-xl md:border md:px-5">
        {error && (
          <p role="alert" className="mb-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          <Link href="/admin/urunler" className="btn btn-ghost">
            Vazgeç
          </Link>
          <button type="submit" disabled={saving || uploading} className="btn btn-primary">
            {saving ? 'Kaydediliyor…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
