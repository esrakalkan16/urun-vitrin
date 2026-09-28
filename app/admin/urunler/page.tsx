'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice, getCover, totalStock } from '@/lib/format';
import { IconPlus, IconSearch } from '@/app/components/icons';
import { ConfirmButton, EmptyState, ListSkeleton, PageHeader, ToastViewport, useToasts } from '../components/ui';

export default function AdminUrunlerPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toasts, push } = useToasts();

  const load = useCallback(async () => {
    const res = await fetch('/api/products?all=true');
    if (res.ok) setProducts(await res.json());
    else setProducts([]);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch('/api/products?all=true')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => alive && setProducts(data))
      .catch(() => alive && setProducts([]));
    return () => {
      alive = false;
    };
  }, []);

  const active = (products ?? []).filter((p) => p.isActive);
  const stock = active.reduce((s, p) => s + totalStock(p.variants), 0);
  const q = search.trim().toLocaleLowerCase('tr');
  const visible = q ? active.filter((p) => p.title.toLocaleLowerCase('tr').includes(q)) : active;

  async function sellOne(product: Product, variantId: string, sizeName: string) {
    setBusyId(variantId);
    try {
      const res = await fetch(`/api/products/${product.id}/sell-variant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      push(
        data.isArchived
          ? `${product.title}: stok bitti, ürün Satılanlar'a taşındı.`
          : `${product.title} · ${sizeName}: 1 adet düşüldü.`,
      );
      await load();
    } catch {
      push('İşlem yapılamadı, tekrar deneyin.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function markSold(product: Product) {
    setBusyId(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}/sold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      if (!res.ok) throw new Error();
      push(`${product.title} satıldı olarak işaretlendi.`);
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
        title="Ürünler"
        description={
          products ? `${active.length} ürün vitrinde · toplam ${stock} adet stok` : 'Yükleniyor…'
        }
        actions={
          <Link href="/admin/urunler/yeni" className="btn btn-primary">
            <IconPlus className="h-4 w-4" />
            Yeni ürün
          </Link>
        }
      />

      {products === null ? (
        <ListSkeleton />
      ) : active.length === 0 ? (
        <EmptyState
          title="Vitrinde henüz ürün yok"
          text="İlk ürününüzü ekleyin; fotoğraf, fiyat ve yaş gruplarına göre stok girmeniz yeterli."
          action={
            <Link href="/admin/urunler/yeni" className="btn btn-primary">
              İlk ürünü ekle
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-72">
              <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <label htmlFor="q" className="sr-only">
                Ürün ara
              </label>
              <input
                id="q"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ürün ara"
                className="input pl-10"
              />
            </div>
            <p className="text-xs text-muted">
              Satış yaptığınızda ilgili yaş grubuna tıklayın ve onaylayın — stok 1 azalır.
            </p>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title="Sonuç bulunamadı"
              text={`“${search}” ile eşleşen ürün yok.`}
              action={
                <button type="button" onClick={() => setSearch('')} className="btn btn-secondary">
                  Aramayı temizle
                </button>
              }
            />
          ) : (
            <ul className="card divide-y divide-line">
              {visible.map((product) => {
                const cover = getCover(product.images);
                return (
                  <li key={product.id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6">
                    <Link href={`/admin/urunler/${product.id}`} className="group flex min-w-0 items-center gap-3 md:w-72 md:shrink-0">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-subtle">
                        {cover && <Image src={cover.url} alt="" fill sizes="56px" className="object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink group-hover:underline">{product.title}</p>
                        <p className="mt-0.5 text-sm text-muted">{formatPrice(product.price)}</p>
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-wrap gap-2" aria-label="Yaş grubu stokları">
                      {product.variants.map((v) => {
                        const out = v.quantity === 0;
                        if (out) {
                          return (
                            <span
                              key={v.id}
                              className="inline-flex h-9 items-center gap-2 border border-dashed border-line px-3 text-sm text-muted/70"
                            >
                              {v.category.name}
                              <span className="text-xs">tükendi</span>
                            </span>
                          );
                        }
                        return (
                          <ConfirmButton
                            key={v.id}
                            disabled={busyId !== null}
                            onConfirm={() => sellOne(product, v.id, v.category.name)}
                            aria-label={`${v.category.name}: ${v.quantity} adet. 1 adet satış düşmek için tıklayın`}
                            title="1 adet satış düş"
                            className="inline-flex h-9 items-center gap-2 border border-line bg-surface pr-1.5 pl-3 text-sm text-ink transition-colors hover:border-ink-soft disabled:opacity-50"
                            confirmClassName="is-selected inline-flex h-9 items-center px-3.5 text-sm font-medium"
                            confirmLabel={`${v.category.name}: 1 adet düş`}
                          >
                            {v.category.name}
                            <span
                              className={`inline-flex h-6 min-w-6 items-center justify-center px-1.5 text-xs font-semibold ${
                                v.quantity <= 1 ? 'bg-accent-soft text-accent' : 'bg-subtle text-ink-soft'
                              }`}
                            >
                              {v.quantity}
                            </span>
                          </ConfirmButton>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 md:shrink-0">
                      <Link href={`/admin/urunler/${product.id}`} className="btn btn-secondary btn-sm flex-1 md:flex-none">
                        Düzenle
                      </Link>
                      <ConfirmButton
                        disabled={busyId !== null}
                        onConfirm={() => markSold(product)}
                        className="btn btn-ghost btn-sm flex-1 md:flex-none"
                        confirmClassName="btn btn-danger btn-sm flex-1 md:flex-none"
                        confirmLabel="Onaylıyor musunuz?"
                        aria-label={`${product.title} ürününü satıldı olarak işaretle`}
                      >
                        Satıldı
                      </ConfirmButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ToastViewport toasts={toasts} />
    </>
  );
}
