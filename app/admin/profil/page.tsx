'use client';

import { useEffect, useState } from 'react';
import { PageHeader, Section, ToastViewport, useToasts } from '../components/ui';

type Form = {
  adminEmail: string;
  newPassword: string;
  currentPassword: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
};

const empty: Form = { adminEmail: '', newPassword: '', currentPassword: '', phone: '', whatsapp: '', email: '', address: '' };

export default function AdminAyarlarPage() {
  const [form, setForm] = useState<Form>(empty);
  const [savedEmail, setSavedEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { toasts, push } = useToasts();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => {
        setSavedEmail(d.adminEmail ?? '');
        setForm({
          adminEmail: d.adminEmail ?? '',
          newPassword: '',
          currentPassword: '',
          phone: d.phone ?? '',
          whatsapp: d.whatsapp ?? '',
          email: d.email ?? '',
          address: d.address ?? '',
        });
      })
      .catch(() => setError('Ayarlar yüklenemedi. Sayfayı yenileyin.'))
      .finally(() => setLoading(false));
  }, []);

  const loginChanged =
    form.newPassword.trim() !== '' || form.adminEmail.trim().toLowerCase() !== savedEmail.trim().toLowerCase();

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.newPassword && form.newPassword.trim().length < 8) {
      setError('Yeni şifre en az 8 karakter olmalı.');
      return;
    }
    if (loginChanged && !form.currentPassword) {
      setError('Giriş bilgilerini değiştirmek için mevcut şifrenizi girin.');
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
          currentPassword: form.currentPassword.trim() || undefined,
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        }),
      });
      if (res.ok) {
        setSavedEmail(form.adminEmail.trim().toLowerCase());
        setForm((f) => ({ ...f, adminEmail: f.adminEmail.trim().toLowerCase(), newPassword: '', currentPassword: '' }));
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
          <div className="skeleton h-64" />
          <div className="skeleton h-48" />
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
                <p className="hint">En az 8 karakter.</p>
              </div>
              {loginChanged && (
                <div className="sm:col-span-2">
                  <label htmlFor="currentPassword" className="label">
                    Mevcut şifre
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={form.currentPassword}
                    onChange={set('currentPassword')}
                    autoComplete="current-password"
                    required
                    className="input"
                  />
                  <p className="hint">Giriş e-postası ya da şifre değişeceği için güvenlik amacıyla mevcut şifreniz gerekiyor.</p>
                </div>
              )}
            </div>
          </Section>

          {error && (
            <p role="alert" className=" bg-danger-soft px-4 py-3 text-sm text-danger">
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
