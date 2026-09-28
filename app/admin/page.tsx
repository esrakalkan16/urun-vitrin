'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Category, Product } from '@/lib/types';
import { formatPrice, getCover, totalStock } from '@/lib/format';
import { IconPlus } from '@/app/components/icons';
import { Reveal } from '@/app/components/Reveal';
import { PageHeader } from './components/ui';

type Data = { products: Product[]; categories: Category[] };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export default function AdminGenelBakisPage() {
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch('/api/products?all=true').then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/categories').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([products, categories]) => alive && setData({ products, categories }))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="font-display text-xl font-light">Veriler yüklenemedi</p>
        <p className="mt-2 text-sm text-muted">Sayfayı yenileyip tekrar deneyin.</p>
      </div>
    );
  }

  if (!data) return <DashboardSkeleton />;

  const active = data.products.filter((p) => p.isActive);
  const sold = data.products.filter((p) => !p.isActive);
  const stock = active.reduce((s, p) => s + totalStock(p.variants), 0);
  const value = active.reduce((s, p) => s + Number(p.price) * totalStock(p.variants), 0);
  const lowStock = active
    .map((p) => ({ p, qty: totalStock(p.variants) }))
    .filter(({ qty }) => qty > 0 && qty <= 2)
    .sort((a, b) => a.qty - b.qty);
  const emptySizes = active.flatMap((p) =>
    p.variants.filter((v) => v.quantity === 0).map((v) => ({ p, size: v.category.name })),
  );

  // Yaş grubuna göre vitrindeki stok
  const byCategory = data.categories
    .map((c) => ({
      name: c.name,
      qty: active.reduce((s, p) => s + (p.variants.find((v) => v.category.id === c.id)?.quantity ?? 0), 0),
    }))
    .filter((c) => c.qty > 0);
  const maxQty = Math.max(1, ...byCategory.map((c) => c.qty));

  const tiles = [
    { label: 'Vitrindeki ürün', value: String(active.length), note: `${data.categories.length} yaş grubunda`, tone: 'bg-peach' },
    { label: 'Toplam stok', value: `${stock}`, unit: 'adet', note: `${emptySizes.length} beden tükendi`, tone: 'bg-mint' },
    { label: 'Stok değeri', value: formatPrice(value), note: 'Vitrindeki ürünlerin toplamı', tone: 'bg-sky' },
    { label: 'Satılan ürün', value: String(sold.length), note: 'Satılanlar arşivinde', tone: 'bg-butter' },
  ];

  const attention = [
    ...lowStock.map(({ p, qty }) => ({ key: `low-${p.id}`, p, text: `Son ${qty} adet kaldı` })),
    ...emptySizes.map(({ p, size }, i) => ({ key: `empty-${p.id}-${i}`, p, text: `${size} tükendi` })),
  ].slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="Genel bakış"
        title={greeting()}
        description="Mağazanızın bugünkü durumu."
        actions={
          <Link href="/admin/urunler/yeni" className="btn btn-primary">
            <IconPlus className="h-4 w-4" />
            Yeni ürün
          </Link>
        }
      />

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <Reveal key={t.label} delay={i * 70} className={`${t.tone} flex min-h-36 flex-col justify-between p-5 md:p-6`}>
            <p className="text-[11px] font-medium tracking-[0.16em] text-ink-soft uppercase">{t.label}</p>
            <div>
              <p className="font-display mt-4 text-3xl font-light text-ink md:text-4xl">
                {t.value}
                {t.unit && <span className="ml-1.5 text-base text-ink-soft">{t.unit}</span>}
              </p>
              <p className="mt-1 text-xs text-ink-soft">{t.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:mt-6 md:gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Yaş grubuna göre stok */}
        <Reveal className="card p-5 md:p-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[11px] font-medium tracking-[0.16em] uppercase">Yaş grubuna göre stok</h2>
            <span className="text-xs text-muted">adet</span>
          </div>
          {byCategory.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Vitrinde stoklu ürün yok.</p>
          ) : (
            <ul className="mt-6 space-y-3.5">
              {byCategory.map((c) => (
                <li key={c.name} className="group grid grid-cols-[88px_1fr_40px] items-center gap-3 text-sm" title={`${c.name}: ${c.qty} adet`}>
                  <span className="truncate text-ink-soft">{c.name}</span>
                  <span className="relative h-2.5 bg-subtle">
                    <span
                      className="absolute inset-y-0 left-0 rounded-r-[4px] bg-accent transition-[width,opacity] duration-700 ease-out group-hover:opacity-80"
                      style={{ width: `${(c.qty / maxQty) * 100}%` }}
                    />
                  </span>
                  <span className="text-right font-medium tabular-nums">{c.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        {/* İlgilenilmesi gerekenler */}
        <Reveal delay={80} className="card p-5 md:p-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[11px] font-medium tracking-[0.16em] uppercase">Göz atmanız gerekenler</h2>
            <span className="text-xs text-muted">{lowStock.length + emptySizes.length}</span>
          </div>
          {attention.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Her şey yolunda — azalan ya da tükenen stok yok.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {attention.map(({ key, p, text }) => (
                <li key={key}>
                  <Link href={`/admin/urunler/${p.id}`} className="group flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-ink group-hover:underline">{p.title}</span>
                      <span className="text-xs text-accent">{text}</span>
                    </span>
                    <span className="shrink-0 text-[11px] tracking-[0.12em] text-muted uppercase">Düzenle →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>

      {/* Son eklenenler */}
      <Reveal className="card mt-4 p-5 md:mt-6 md:p-7">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[11px] font-medium tracking-[0.16em] uppercase">Son eklenen ürünler</h2>
          <Link href="/admin/urunler" className="text-[11px] tracking-[0.12em] text-muted uppercase hover:text-ink">
            Tümü →
          </Link>
        </div>
        {active.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted">Vitrinde henüz ürün yok.</p>
            <Link href="/admin/urunler/yeni" className="btn btn-primary mt-5">
              İlk ürünü ekle
            </Link>
          </div>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {active.slice(0, 5).map((p) => {
              const cover = getCover(p.images);
              return (
                <li key={p.id}>
                  <Link href={`/admin/urunler/${p.id}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-subtle">
                      {cover && (
                        <Image
                          src={cover.url}
                          alt=""
                          fill
                          sizes="200px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      )}
                    </div>
                    <p className="mt-2 truncate text-sm">{p.title}</p>
                    <p className="text-xs text-muted">
                      {formatPrice(p.price)} · {totalStock(p.variants)} adet
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Reveal>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton mt-3 h-9 w-56" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-36" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="skeleton h-64" />
        <div className="skeleton h-64" />
      </div>
    </div>
  );
}
