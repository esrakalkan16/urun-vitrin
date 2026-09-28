'use client';

import Link from 'next/link';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { IconChat } from './icons';
import { useStoreSettings } from './useStoreSettings';

export function StoreFooter() {
  const settings = useStoreSettings();
  const waLink = settings
    ? buildWhatsAppLink(settings.whatsapp || settings.phone, 'Merhaba, bilgi almak istiyorum.')
    : null;

  const heading = 'text-[11px] font-medium tracking-[0.16em] uppercase';

  return (
    <footer id="iletisim" className="mt-auto scroll-mt-20 bg-subtle">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <Link href="/" className="inline-block">
            <span lang="fr" className="font-display block text-2xl font-medium tracking-[0.2em] uppercase">L&rsquo;Atelier</span>
            <span className="block text-[10px] tracking-[0.5em] text-muted uppercase">Enfant</span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed font-light text-ink-soft">
            Miniklerin dünyasına biraz daha yumuşaklık katmak için doğal liflerden, özenle seçilmiş kıyafetler.
          </p>
        </div>

        <div>
          <h2 className={heading}>İletişim</h2>
          {settings === undefined ? (
            <div className="mt-5 space-y-2.5" aria-hidden="true">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-4 w-32" />
            </div>
          ) : settings ? (
            <ul className="mt-5 space-y-2.5 text-sm font-light text-ink-soft">
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-ink hover:underline">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="hover:text-ink hover:underline">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.address && <li className="leading-relaxed">{settings.address}</li>}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-muted">İletişim bilgileri şu an yüklenemedi.</p>
          )}
        </div>

        <div>
          <h2 className={heading}>Sipariş</h2>
          <p className="mt-5 text-sm leading-relaxed font-light text-ink-soft">
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

      <div className="border-t border-line">
        <p className="container-page py-5 text-[11px] tracking-[0.12em] text-muted uppercase">
          © {new Date().getFullYear()} <span lang="fr">L&rsquo;Atelier Enfant</span>
        </p>
      </div>
    </footer>
  );
}
