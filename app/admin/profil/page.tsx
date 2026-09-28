'use client';

import { useEffect, useState } from 'react';
import { PageHeader, Section, ToastViewport, useToasts } from '../components/ui';

type Form = {
  adminEmail: string;
  newPassword: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
};

const empty: Form = { adminEmail: '', newPassword: '', phone: '', whatsapp: '', email: '', address: '' };

export default function AdminAyarlarPage() {
  const [form, setForm] = useState<Form>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { toasts, push } = useToasts();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) =>
        setForm({
          adminEmail: d.adminEmail ?? '',
          newPassword: '',
          phone: d.phone ?? '',
          whatsapp: d.whatsapp ?? '',
          email: d.email ?? '',
          address: d.address ?? '',
        }),
      )
      .catch(() => setError('Ayarlar yüklenemedi. Sayfayı yenileyin.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.newPassword && form.newPassword.trim().length < 6) {
      setError('Yeni şifre en az 6 karakter olmalı.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: form.adminEmail.trim(),
          adminPassword: form.newPassword.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        }),
      });
      if (res.ok) {
        setForm((f) => ({ ...f, newPassword: '' }));
        push('Ayarlar kaydedildi.');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Kaydedilemedi.');
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    }
    setSaving(false);
  }

  return (
    <>
      <PageHeader title="Ayarlar" description="Müşterilerin gördüğü iletişim bilgileri ve giriş bilgileriniz." />

      {loading ? (
        <div className="space-y-4" aria-hidden="true">
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Section
            title="Mağaza iletişim bilgileri"
            description="Vitrinin alt kısmında gösterilir. WhatsApp numarası sipariş butonlarında kullanılır."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="whatsapp" className="label">
                  WhatsApp numarası
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="tel"
                  value={form.whatsapp}
                  onChange={set('whatsapp')}
                  placeholder="0532 123 45 67"
                  className="input"
                />
                <p className="hint">Sipariş mesajları bu numaraya gelir. 05xx ile ya da 90 ülke koduyla yazabilirsiniz.</p>
              </div>
              <div>
                <label htmlFor="phone" className="label">
                  Telefon
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="0532 123 45 67"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="info@magaza.com"
                  className="input"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="label">
                  Adres / şehir
                </label>
                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Kadıköy, İstanbul"
                  className="input"
                />
              </div>
            </div>
          </Section>

          <Section title="Giriş bilgileri" description="Yönetim paneline girerken kullandığınız bilgiler.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="adminEmail" className="label">
                  Giriş e-postası
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  value={form.adminEmail}
                  onChange={set('adminEmail')}
                  autoComplete="username"
                  required
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="label">
                  Yeni şifre
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={set('newPassword')}
                  autoComplete="new-password"
                  placeholder="Değiştirmeyecekseniz boş bırakın"
                  className="input"
                />
                <p className="hint">En az 6 karakter.</p>
              </div>
            </div>
          </Section>

          {error && (
            <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Kaydediliyor…' : 'Değişiklikleri kaydet'}
            </button>
          </div>
        </form>
      )}

      <ToastViewport toasts={toasts} />
    </>
  );
}
