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
        router.push('/admin');
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
    <div className="grid min-h-screen bg-white md:grid-cols-2">
      {/* Sol: marka paneli */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sky p-12 md:flex lg:p-16">
        <Link href="/" className="inline-block">
          <span lang="fr" className="font-display block text-2xl font-medium tracking-[0.2em] uppercase">
            L&rsquo;Atelier
          </span>
          <span className="block text-[10px] tracking-[0.5em] text-ink-soft uppercase">Enfant</span>
        </Link>

        <div className="animate-fade-up">
          <p className="eyebrow text-ink-soft">Mağaza yönetimi</p>
          <h1 className="font-display mt-4 text-5xl leading-[1.05] font-light lg:text-6xl">
            Vitrininiz,
            <br />
            <span className="font-medium italic">tek yerden.</span>
          </h1>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink-soft">
            Ürün ekleyin, stokları güncelleyin, satışları takip edin. Müşterileriniz değişiklikleri anında görür.
          </p>
        </div>

        <p className="text-[11px] tracking-[0.14em] text-ink-soft uppercase">© {new Date().getFullYear()} <span lang="fr">L&rsquo;Atelier Enfant</span></p>

        {/* yumuşak süs daireleri */}
        <span aria-hidden="true" className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/40" />
        <span aria-hidden="true" className="absolute top-24 -right-10 h-32 w-32 rounded-full bg-mint/70" />
      </aside>

      {/* Sağ: giriş formu */}
      <div className="flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center md:hidden">
            <span lang="fr" className="font-display block text-2xl font-medium tracking-[0.2em] uppercase">
              L&rsquo;Atelier
            </span>
            <span className="block text-[10px] tracking-[0.5em] text-muted uppercase">Enfant</span>
          </div>

          <p className="eyebrow">Hoş geldiniz</p>
          <h2 className="font-display mt-2 text-3xl font-light">Giriş yapın</h2>
          <p className="mt-2 text-sm text-muted">Yönetim paneline erişmek için bilgilerinizi girin.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
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
                  className="text-[11px] tracking-[0.12em] text-muted uppercase underline-offset-4 hover:text-ink hover:underline"
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
              <p id="login-error" role="alert" className="border-l-2 border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading || !password} className="btn btn-primary w-full">
              {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
            </button>
          </form>

          <p className="mt-8 text-center">
            <Link href="/" className="btn btn-ghost btn-sm">
              ← Vitrine dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
