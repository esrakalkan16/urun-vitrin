'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '../../components/ui';
import { ProductForm, type ProductPayload } from '../../components/ProductForm';

export default function YeniUrunPage() {
  const router = useRouter();

  async function create(payload: ProductPayload): Promise<string | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push('/admin/urunler');
        return null;
      }
      const data = await res.json().catch(() => ({}));
      return data.error ?? 'Ürün kaydedilemedi.';
    } catch {
      return 'Sunucuya bağlanılamadı.';
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Yeni ürün" back={{ href: '/admin/urunler', label: 'Ürünler' }} />
      <ProductForm submitLabel="Ürünü yayınla" onSubmit={create} />
    </div>
  );
}
