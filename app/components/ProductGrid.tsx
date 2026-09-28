'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Category, Product } from '@/lib/types';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

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
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let alive = true;
    const url = key ? `/api/products?category=${encodeURIComponent(key)}` : '/api/products';
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Product[]) => alive && setResult({ key, products: data }))
      .catch(() => alive && setResult({ key, products: null }));
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
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const chip = (active: boolean) =>
    `h-9 shrink-0 rounded-full border px-4 text-sm transition-colors ${
      active
        ? 'border-ink bg-ink text-white'
        : 'border-line bg-surface text-ink-soft hover:border-ink-soft hover:text-ink'
    }`;

  return (
    <>
      {/* Filtre çubuğu */}
      <div className="sticky top-16 z-30 border-b border-line bg-canvas/95 backdrop-blur-md">
        <div className="container-page flex items-center gap-4 py-3">
          <div
            role="group"
            aria-label="Yaş grubuna göre filtrele"
            className="no-scrollbar -mx-4 flex flex-1 items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0"
          >
            <button type="button" onClick={() => selectCategory(null)} aria-pressed={!selected} className={chip(!selected)}>
              Tümü
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.name)}
                aria-pressed={selected === cat.name}
                className={chip(selected === cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {!loading && products && (
            <p className="hidden shrink-0 text-sm text-muted sm:block" aria-live="polite">
              {products.length} ürün
            </p>
          )}
        </div>
      </div>

      {/* Ürünler */}
      <section
        aria-label={selected ? `${selected} ürünleri` : 'Tüm ürünler'}
        aria-busy={loading}
        className="container-page py-8 md:py-10"
      >
        {loading ? (
          <ProductGridSkeleton />
        ) : products === null ? (
          <div className="py-20 text-center">
            <p className="text-base text-ink">Ürünler yüklenemedi.</p>
            <p className="mt-1 text-sm text-muted">Bağlantınızı kontrol edip tekrar deneyin.</p>
            <button type="button" onClick={() => setReloadToken((n) => n + 1)} className="btn btn-secondary mt-5">
              Tekrar dene
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl text-ink">
              {selected ? `${selected} için şu an ürün yok` : 'Koleksiyon hazırlanıyor'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {selected ? 'Yeni ürünler eklendikçe burada göreceksiniz.' : 'Yakında yeni parçalarla buradayız.'}
            </p>
            {selected && (
              <button type="button" onClick={() => selectCategory(null)} className="btn btn-secondary mt-6">
                Tüm ürünleri göster
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
