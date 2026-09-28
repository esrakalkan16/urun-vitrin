'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { IconChat } from './icons';
import { useStoreSettings } from './useStoreSettings';

const announcements = [
  'WhatsApp ile kolay sipariş',
  '%100 doğal kumaşlar',
  'Stok bilgisi her üründe',
  '6 aydan 10 yaşa özenli seçimler',
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
      <div className="group overflow-hidden bg-caramel text-white" aria-label="Duyurular">
        <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {[...announcements, ...announcements].map((t, i) => (
                <li key={i} className="flex items-center py-2 text-[11px] tracking-[0.14em] whitespace-nowrap uppercase">
                  <span className="px-6">{t}</span>
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/70" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-[border-color,box-shadow] duration-300 ${
          scrolled ? 'border-line shadow-[0_6px_24px_-18px_rgba(0,0,0,0.25)]' : 'border-transparent'
        }`}
      >
        <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
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

          <Link href="/" className="text-center" aria-label="L'Atelier Enfant — Ana sayfa">
            <span lang="fr" className="font-display block text-xl font-medium tracking-[0.2em] uppercase md:text-2xl">
              L&rsquo;Atelier
            </span>
            <span className="block text-[9px] tracking-[0.5em] text-muted uppercase md:text-[10px]">Enfant</span>
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
