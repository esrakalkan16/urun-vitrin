'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Category, Product } from '@/lib/types';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { Reveal } from './Reveal';
import { loadCategories, loadProducts } from './storeData';

type Result = { key: string; products: Product[] | null };

export default function ProductGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Seçili kategori URL'de tutulur: paylaşılabilir ve geri tuşu çalışır.
  const selected = searchParams.get('kategori');
  const key = selected ?? '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let alive = true;
    loadCategories().then((c) => alive && setCategories(c));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const request =
      key === '' && reloadToken === 0
        ? loadProducts()
        : fetch(key ? `/api/products?category=${encodeURIComponent(key)}` : '/api/products')
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null);
    request.then((data: Product[] | null) => alive && setResult({ key, products: data }));
    return () => {
      alive = false;
    };
  }, [key, reloadToken]);

  const loading = !result || result.key !== key;
  const products = loading ? [] : result.products;

  function selectCategory(name: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (name) params.set('kategori', name);
    else params.delete('kategori');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}#koleksiyon` : `${pathname}#koleksiyon`, { scroll: false });
  }

  const tab = (active: boolean) =>
    `relative shrink-0 py-3 text-[11px] font-medium tracking-[0.16em] uppercase transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-ink after:transition-transform after:duration-300 ${
      active ? 'text-ink after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100'
    }`;

  return (
    <div className="container-page pt-16 md:pt-24">
      <Reveal className="text-center">
        <p className="eyebrow">Koleksiyon</p>
        <h2 className="font-display mt-2 text-3xl font-light md:text-4xl">{selected ?? 'Tüm ürünler'}</h2>
        {!loading && products && <p className="mt-2 text-sm text-muted">{products.length} ürün</p>}
      </Reveal>

      {/* Filtre sekmeleri */}
      <div
        role="group"
        aria-label="Yaş grubuna göre filtrele"
        className="no-scrollbar -mx-4 mt-8 flex gap-7 overflow-x-auto border-b border-line px-4 md:mx-0 md:justify-center md:px-0"
      >
        <button type="button" onClick={() => selectCategory(null)} aria-pressed={!selected} className={tab(!selected)}>
          Tümü
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => selectCategory(cat.name)}
            aria-pressed={selected === cat.name}
            className={tab(selected === cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div aria-busy={loading} className="pt-10">
        {loading ? (
          <ProductGridSkeleton />
        ) : products === null ? (
          <div className="py-20 text-center">
            <p className="text-base text-ink">Ürünler yüklenemedi.</p>
            <p className="mt-1 text-sm text-muted">Bağlantınızı kontrol edip tekrar deneyin.</p>
            <button type="button" onClick={() => setReloadToken((n) => n + 1)} className="btn btn-secondary mt-6">
              Tekrar dene
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl font-light">
              {selected ? `${selected} için şu an ürün yok` : 'Koleksiyon hazırlanıyor'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {selected ? 'Yeni ürünler eklendikçe burada göreceksiniz.' : 'Yakında yeni parçalarla buradayız.'}
            </p>
            {selected && (
              <button type="button" onClick={() => selectCategory(null)} className="btn btn-secondary mt-7">
                Tüm ürünleri göster
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
