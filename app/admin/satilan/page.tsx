'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatPrice, getCover } from '@/lib/format';
import { EmptyState, ListSkeleton, PageHeader, ToastViewport, useToasts } from '../components/ui';

export default function SatilanlarPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toasts, push } = useToasts();

  const load = useCallback(async () => {
    const res = await fetch('/api/products?all=true');
    const data: Product[] = res.ok ? await res.json() : [];
    setProducts(data.filter((p) => !p.isActive));
  }, []);

  useEffect(() => {
    let alive = true;
    fetch('/api/products?all=true')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Product[]) => alive && setProducts(data.filter((p) => !p.isActive)))
      .catch(() => alive && setProducts([]));
    return () => {
      alive = false;
    };
  }, []);

  async function restore(product: Product) {
    setBusyId(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}/sold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error();
      push(`${product.title} tekrar vitrinde.`);
      await load();
    } catch {
      push('İşlem yapılamadı, tekrar deneyin.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Satılanlar"
        description="Satıldı olarak işaretlenen ürünler. Yanlışlıkla işaretlediyseniz tekrar vitrine alabilirsiniz."
      />

      {products === null ? (
        <ListSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          title="Henüz satılan ürün yok"
          text="Ürünler sayfasında bir ürünü “Satıldı” olarak işaretlediğinizde ya da stoğu bittiğinde burada listelenir."
        />
      ) : (
        <ul className="card divide-y divide-line">
          {products.map((product) => {
            const cover = getCover(product.images);
            return (
              <li key={product.id} className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-subtle">
                  {cover && (
                    <Image src={cover.url} alt="" fill sizes="56px" className="object-cover opacity-80 grayscale" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{product.title}</p>
                  <p className="mt-0.5 truncate text-sm text-muted">
                    {formatPrice(product.price)}
                    {product.variants.length > 0 && ` · ${product.variants.map((v) => v.category.name).join(', ')}`}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => restore(product)}
                  className="btn btn-secondary btn-sm"
                >
                  {busyId === product.id ? 'Alınıyor…' : 'Vitrine geri al'}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ToastViewport toasts={toasts} />
    </>
  );
}
