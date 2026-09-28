'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminGirisPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() || undefined, password: password.trim() }),
      });
      if (res.ok) {
        router.push('/admin/urunler');
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'E-posta veya şifre hatalı.');
    } catch {
      setError('Sunucuya bağlanılamadı. Tekrar deneyin.');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-gradient text-3xl font-semibold">L&rsquo;Atelier Enfant</p>
          <p className="mt-2 text-sm text-muted">Mağaza yönetimine giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5 p-6 md:p-8" noValidate>
          <div>
            <label htmlFor="email" className="label">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              autoComplete="email"
              className="input"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-ink">
                Şifre
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                {showPassword ? 'Gizle' : 'Göster'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              className="input"
            />
          </div>

          {error && (
            <p id="login-error" role="alert" className="rounded-lg bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || !password} className="btn btn-primary w-full">
            {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            Vitrine dön
          </Link>
        </p>
      </div>
    </div>
  );
}
