'use client';

import { buildWhatsAppLink } from '@/lib/whatsapp';
import { IconChat } from './icons';
import { useStoreSettings } from './useStoreSettings';

export function StoreFooter() {
  const settings = useStoreSettings();
  const waLink = settings
    ? buildWhatsAppLink(settings.whatsapp || settings.phone, 'Merhaba, bilgi almak istiyorum.')
    : null;

  return (
    <footer id="iletisim" className="mt-auto scroll-mt-20 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr] md:py-16">
        <div>
          <p className="font-serif text-2xl text-ink">L&rsquo;Atelier Enfant</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
            Doğal liflerden, özenle seçilmiş çocuk kıyafetleri.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-medium tracking-[0.14em] text-muted uppercase">İletişim</h2>
          {settings === undefined ? (
            <div className="mt-4 space-y-2.5" aria-hidden="true">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-4 w-32" />
            </div>
          ) : settings ? (
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
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
            <p className="mt-4 text-sm text-muted">İletişim bilgileri şu an yüklenemedi.</p>
          )}
        </div>

        <div>
          <h2 className="text-xs font-medium tracking-[0.14em] text-muted uppercase">Sipariş</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Siparişlerinizi WhatsApp üzerinden alıyoruz. Beden ve stok için bize yazmanız yeterli.
          </p>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm mt-4">
              <IconChat className="h-4 w-4" />
              WhatsApp&rsquo;tan yazın
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-line">
        <p className="container-page py-5 text-xs text-muted">
          © {new Date().getFullYear()} L&rsquo;Atelier Enfant
        </p>
      </div>
    </footer>
  );
}
