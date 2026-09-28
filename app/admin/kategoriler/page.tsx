'use client';

import { useEffect, useState } from 'react';
import type { Category } from '@/lib/types';
import { PageHeader } from '../components/ui';

export default function KategorilerPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const value = name.trim();
    if (!value) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value }),
      });
      if (res.ok) {
        const created: Category = await res.json();
        setCategories((prev) => [...(prev ?? []), created]);
        setName('');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Kategori eklenemedi. Aynı isimde bir kategori olabilir.');
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Kategoriler"
        description="Ürünlerde kullandığınız yaş grupları. Müşteriler vitrinde bu gruplara göre filtreleme yapar."
      />

      <form onSubmit={handleAdd} className="card p-5">
        <label htmlFor="cat" className="label">
          Yeni yaş grubu
        </label>
        <div className="flex gap-2">
          <input
            id="cat"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. 4-5 Yaş"
            className="input"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'cat-error' : undefined}
          />
          <button type="submit" disabled={saving || !name.trim()} className="btn btn-primary">
            {saving ? 'Ekleniyor…' : 'Ekle'}
          </button>
        </div>
        {error && (
          <p id="cat-error" role="alert" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
      </form>

      <div className="mt-6">
        <p className="mb-3 text-sm text-muted">
          {categories === null ? 'Yükleniyor…' : `${categories.length} yaş grubu`}
        </p>
        {categories === null ? (
          <div className="card space-y-3 p-5" aria-hidden="true">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-20" />
          </div>
        ) : categories.length === 0 ? (
          <div className="card px-5 py-10 text-center text-sm text-muted">
            Henüz yaş grubu yok. Ürün ekleyebilmek için en az bir tane oluşturun.
          </div>
        ) : (
          <ul className="card divide-y divide-line">
            {categories.map((cat) => (
              <li key={cat.id} className="px-5 py-3.5 text-sm text-ink">
                {cat.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
