'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { ConfirmButton, PageHeader } from '../../components/ui';
import { ProductForm, type ProductFormValues, type ProductPayload } from '../../components/ProductForm';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; values: ProductFormValues; isActive: boolean };

export default function UrunDuzenlePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((p: Product) => {
        if (!alive) return;
        const stock: Record<string, number> = {};
        p.variants.forEach((v) => (stock[v.category.id] = v.quantity));
        setState({
          status: 'ready',
          isActive: p.isActive,
          values: {
            title: p.title ?? '',
            description: p.description ?? '',
            price: String(p.price ?? ''),
            images: p.images.map((img) => ({ url: img.url, isCover: img.isCover })),
            stock,
          },
        });
      })
      .catch(() => alive && setState({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [id]);

  async function save(payload: ProductPayload): Promise<string | null> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push('/admin/urunler');
        return null;
      }
      const data = await res.json().catch(() => ({}));
      return data.error ?? 'Ürün güncellenemedi.';
    } catch {
      return 'Sunucuya bağlanılamadı.';
    }
  }

  async function setActive(isActive: boolean) {
    setStatusBusy(true);
    const res = await fetch(`/api/products/${id}/sold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) router.push(isActive ? '/admin/urunler' : '/admin/satilan');
    else setStatusBusy(false);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ürünü düzenle" back={{ href: '/admin/urunler', label: 'Ürünler' }} />

      {state.status === 'loading' && (
        <div className="space-y-6" aria-hidden="true">
          <div className="skeleton h-72" />
          <div className="skeleton h-48" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="card px-6 py-16 text-center">
          <p className="font-display text-xl font-light text-ink">Ürün bulunamadı</p>
          <Link href="/admin/urunler" className="btn btn-secondary mt-6">
            Ürünlere dön
          </Link>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <ProductForm initial={state.values} submitLabel="Değişiklikleri kaydet" onSubmit={save} />

          <section className="card mt-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-7">
            <div>
              <h2 className="text-[11px] font-medium tracking-[0.16em] text-ink uppercase">Satış durumu</h2>
              <p className="mt-1 text-sm text-muted">
                {state.isActive
                  ? 'Ürün vitrinde. Satıldıysa işaretleyin; vitrinden kalkar ve Satılanlar’a taşınır.'
                  : 'Bu ürün satıldı olarak işaretli ve vitrinde görünmüyor.'}
              </p>
            </div>
            {state.isActive ? (
              <ConfirmButton
                disabled={statusBusy}
                onConfirm={() => setActive(false)}
                className="btn btn-secondary"
                confirmClassName="btn btn-danger"
                confirmLabel="Evet, satıldı"
              >
                Satıldı olarak işaretle
              </ConfirmButton>
            ) : (
              <button type="button" disabled={statusBusy} onClick={() => setActive(true)} className="btn btn-secondary">
                Vitrine geri al
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}
