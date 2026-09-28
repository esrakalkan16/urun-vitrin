'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';
import { IconArrowUpRight } from '@/app/components/icons';

const navItems = [
  { href: '/admin/urunler', label: 'Ürünler' },
  { href: '/admin/satilan', label: 'Satılanlar' },
  { href: '/admin/kategoriler', label: 'Kategoriler' },
  { href: '/admin/profil', label: 'Ayarlar' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/giris') return <>{children}</>;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-8">
            <Link href="/admin/urunler" className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-display text-lg font-semibold text-ink">L&rsquo;Atelier</span>
              <span className="text-xs text-muted">Yönetim</span>
            </Link>

            <nav aria-label="Yönetim menüsü" className="hidden items-center gap-1 md:flex">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    isActive(href) ? 'bg-subtle font-medium text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              Vitrini aç
              <IconArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <LogoutButton />
          </div>
        </div>

        {/* Mobil sekmeler */}
        <nav aria-label="Yönetim menüsü" className="no-scrollbar overflow-x-auto border-t border-line md:hidden">
          <div className="flex px-2">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`shrink-0 border-b-2 px-3 py-3 text-sm transition-colors ${
                  isActive(href) ? 'border-ink font-medium text-ink' : 'border-transparent text-muted'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
