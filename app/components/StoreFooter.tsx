'use client';

import Link from 'next/link';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { IconChat } from './icons';
import { Logo } from './Logo';
import { useStoreSettings } from './useStoreSettings';

export function StoreFooter() {
  const settings = useStoreSettings();
  const waLink = settings
    ? buildWhatsAppLink(settings.whatsapp || settings.phone, 'Merhaba, bilgi almak istiyorum.')
    : null;

  const heading = 'text-[11px] font-medium tracking-[0.16em] text-camel uppercase';

  return (
    <footer id="iletisim" className="mt-auto scroll-mt-24 bg-navy text-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <Link href="/" className="inline-block" aria-label="Veliaht Kids — Ana sayfa">
            <Logo tone="dark" size="lg" tagline="Küçük beyefendiler için" />
          </Link>
          <p className="mt-6 max-w-xs text-sm leading-relaxed font-light text-cream/70">
            Küçük beyefendiler için doğal kumaşlardan, zamansız kesimlerle özenle seçilmiş erkek çocuk kıyafetleri.
          </p>
        </div>

        <div>
          <h2 className={heading}>İletişim</h2>
          {settings === undefined ? (
            <div className="mt-5 space-y-2.5" aria-hidden="true">
              <div className="h-4 w-40 animate-pulse bg-white/10" />
              <div className="h-4 w-48 animate-pulse bg-white/10" />
              <div className="h-4 w-32 animate-pulse bg-white/10" />
            </div>
          ) : settings ? (
            <ul className="mt-5 space-y-2.5 text-sm font-light text-cream/75">
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-cream hover:underline">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="hover:text-cream hover:underline">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.address && <li className="leading-relaxed">{settings.address}</li>}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-cream/60">İletişim bilgileri şu an yüklenemedi.</p>
          )}
        </div>

        <div>
          <h2 className={heading}>Sipariş</h2>
          <p className="mt-5 text-sm leading-relaxed font-light text-cream/75">
            Siparişlerinizi WhatsApp üzerinden alıyoruz. Beden ve stok için bize yazmanız yeterli.
          </p>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm mt-5">
              <IconChat className="h-4 w-4" />
              WhatsApp&rsquo;tan yazın
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-cream/10">
        <p className="container-page py-5 text-[11px] tracking-[0.12em] text-cream/50 uppercase">
          © {new Date().getFullYear()} Veliaht Kids
        </p>
      </div>
    </footer>
  );
}
