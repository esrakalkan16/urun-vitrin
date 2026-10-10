'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { IconChat } from './icons';
import { Logo } from './Logo';
import { useStoreSettings } from './useStoreSettings';

const announcements = [
  'Küçük beyefendiler için',
  'WhatsApp ile kolay sipariş',
  'Doğal kumaşlar, zamansız kesimler',
  'Stok bilgisi her üründe',
];

export function StoreHeader() {
  const pathname = usePathname();
  const base = pathname === '/' ? '' : '/';
  const settings = useStoreSettings();
  const [scrolled, setScrolled] = useState(false);

  const waLink = settings
    ? buildWhatsAppLink(settings.whatsapp || settings.phone, 'Merhaba, ürünleriniz hakkında bilgi almak istiyorum.')
    : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLink = 'text-[11px] font-medium tracking-[0.16em] text-ink-soft uppercase transition-colors hover:text-ink';

  return (
    <>
      {/* Kayan duyuru bandı */}
      <div className="group overflow-hidden bg-navy text-cream" aria-label="Duyurular">
        <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {[...announcements, ...announcements].map((t, i) => (
                <li key={i} className="flex items-center py-2 text-[11px] tracking-[0.14em] whitespace-nowrap uppercase">
                  <span className="px-6">{t}</span>
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-camel" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b bg-canvas/95 backdrop-blur transition-[border-color,box-shadow] duration-300 ${
          scrolled ? 'border-line shadow-[0_6px_24px_-18px_rgba(31,42,68,0.35)]' : 'border-transparent'
        }`}
      >
        <div className="container-page grid h-18 grid-cols-[1fr_auto_1fr] items-center md:h-24">
          <nav aria-label="Ana gezinti" className="hidden items-center gap-7 md:flex">
            <Link href={`${base}#koleksiyon`} className={navLink}>
              Koleksiyon
            </Link>
            <Link href={`${base}#yas-gruplari`} className={navLink}>
              Yaş grupları
            </Link>
            <Link href={`${base}#siparis`} className={navLink}>
              Nasıl sipariş?
            </Link>
          </nav>
          <span className="md:hidden" />

          <Link href="/" className="flex items-center" aria-label="Veliaht Kids — Ana sayfa">
            <span className="md:hidden">
              <Logo size="sm" tagline="Kids" />
            </span>
            <span className="hidden md:block">
              <Logo />
            </span>
          </Link>

          <div className="flex items-center justify-end gap-6">
            <Link href={`${base}#iletisim`} className={`${navLink} hidden md:inline`}>
              İletişim
            </Link>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-ink uppercase transition-colors hover:text-whatsapp"
              >
                <IconChat className="h-5 w-5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
