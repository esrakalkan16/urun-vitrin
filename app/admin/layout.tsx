'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogoutButton } from './LogoutButton';
import { IconArrowUpRight } from '@/app/components/icons';
import { CrownMark } from '@/app/components/Logo';

const navItems = [
  { href: '/admin', label: 'Genel bakış', exact: true },
  { href: '/admin/urunler', label: 'Ürünler' },
  { href: '/admin/satilan', label: 'Satılanlar' },
  { href: '/admin/kategoriler', label: 'Kategoriler' },
  { href: '/admin/profil', label: 'Ayarlar' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/giris';

  // Oturum (hareketsizlik ya da süre dolduğu için) düşerse API'ler 401 döner:
  // hata göstermek yerine giriş ekranına gönder.
  useEffect(() => {
    if (isLogin) return;
    const original = window.fetch;
    window.fetch = async (...args) => {
      const res = await original(...args);
      const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : args[0].url;
      if (res.status === 401 && new URL(url, location.href).pathname.startsWith('/api/')) {
        router.replace('/admin/giris');
      }
      return res;
    };
    return () => {
      window.fetch = original;
    };
  }, [isLogin, router]);

  if (isLogin) return <>{children}</>;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const tab = (active: boolean) =>
    `relative shrink-0 py-4 text-[11px] font-medium tracking-[0.16em] uppercase transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-camel after:transition-transform after:duration-300 ${
      active ? 'text-ink after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-ink'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-subtle">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <CrownMark className="h-6 w-auto text-navy" />
            <span className="font-serif text-lg font-semibold tracking-[0.06em] text-navy">VELİAHT</span>
            <span className="hidden text-[10px] tracking-[0.3em] text-muted uppercase sm:inline">Yönetim</span>
          </Link>

          <div className="flex items-center gap-1">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              Vitrini aç
              <IconArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <LogoutButton />
          </div>
        </div>

        <nav aria-label="Yönetim menüsü" className="border-t border-line">
          <div className="container-page no-scrollbar flex gap-7 overflow-x-auto">
            {navItems.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href, exact) ? 'page' : undefined}
                className={tab(isActive(href, exact))}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="container-page flex-1 py-8 md:py-12">{children}</main>
    </div>
  );
}
