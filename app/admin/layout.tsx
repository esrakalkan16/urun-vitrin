'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';
import { IconArrowUpRight } from '@/app/components/icons';

const navItems = [
  { href: '/admin', label: 'Genel bakış', exact: true },
  { href: '/admin/urunler', label: 'Ürünler' },
  { href: '/admin/satilan', label: 'Satılanlar' },
  { href: '/admin/kategoriler', label: 'Kategoriler' },
  { href: '/admin/profil', label: 'Ayarlar' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/giris') return <>{children}</>;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const tab = (active: boolean) =>
    `relative shrink-0 py-4 text-[11px] font-medium tracking-[0.16em] uppercase transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink after:transition-transform after:duration-300 ${
      active ? 'text-ink after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-ink'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-subtle">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-baseline gap-3">
            <span lang="fr" className="font-display text-lg font-medium tracking-[0.2em] uppercase">
              L&rsquo;Atelier
            </span>
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
