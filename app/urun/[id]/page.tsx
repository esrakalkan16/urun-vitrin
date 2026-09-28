'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StoreHeader } from '@/app/components/StoreHeader';
import { StoreFooter } from '@/app/components/StoreFooter';
import { ProductCard } from '@/app/components/ProductCard';
import { Reveal } from '@/app/components/Reveal';
import { useStoreSettings } from '@/app/components/useStoreSettings';
import { IconArrowLeft, IconChat, IconImage } from '@/app/components/icons';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { formatPrice, getCover } from '@/lib/format';
import type { Product } from '@/lib/types';

type LoadState =
  | { status: 'loading' }
  | { status: 'notfound' }
  | { status: 'ready'; product: Product; related: Product[] };

export default function UrunDetayPage() {
  const { id } = useParams<{ id: string }>();
  const settings = useStoreSettings();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [imageId, setImageId] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/products').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([product, all]: [Product | null, Product[]]) => {
        if (!alive) return;
        if (!product || 'error' in product) {
          setState({ status: 'notfound' });
          return;
        }
        setState({ status: 'ready', product, related: all.filter((p) => p.id !== id).slice(0, 4) });
        setImageId(getCover(product.images)?.id ?? null);
        setVariantId(product.variants.find((v) => v.quantity > 0)?.id ?? null);
      })
      .catch(() => alive && setState({ status: 'notfound' }));
    return () => {
      alive = false;
    };
  }, [id]);

  // Mobilde sabit sipariş çubuğu footer'ın üstüne binmesin diye alt boşluk
  const hasMobileBar =
    state.status === 'ready' &&
    state.product.isActive &&
    state.product.variants.some((v) => v.quantity > 0) &&
    Boolean(settings && (settings.whatsapp || settings.phone));

  return (
    <div className={`flex min-h-screen flex-col ${hasMobileBar ? 'pb-20 lg:pb-0' : ''}`}>
      <StoreHeader />
      <main className="flex-1 pb-16 lg:pb-24">
        {state.status === 'loading' && <DetailSkeleton />}

        {state.status === 'notfound' && (
          <div className="container-page py-24 text-center">
            <p className="font-display text-3xl font-light text-ink">Bu ürünü bulamadık</p>
            <p className="mt-2 text-sm text-muted">Satılmış ya da kaldırılmış olabilir.</p>
            <Link href="/" className="btn btn-primary mt-6">
              Koleksiyona dön
            </Link>
          </div>
        )}

        {state.status === 'ready' &&
          (() => {
            const { product, related } = state;
            const image = product.images.find((i) => i.id === imageId) ?? getCover(product.images);
            const variant = product.variants.find((v) => v.id === variantId) ?? null;
            const soldOut = !product.isActive || product.variants.every((v) => v.quantity === 0);

            const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
            const message = [
              `Merhaba, "${product.title}" ürünü hakkında bilgi almak istiyorum.`,
              variant ? `Yaş grubu: ${variant.category.name}` : null,
              pageUrl || null,
            ]
              .filter(Boolean)
              .join('\n');
            const waLink = settings ? buildWhatsAppLink(settings.whatsapp || settings.phone, message) : null;

            return (
              <>
                <div className="container-page pt-6 md:pt-8">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Koleksiyon
                  </Link>
                </div>

                <div className="container-page mt-6 grid gap-8 lg:grid-cols-2 lg:gap-16">
                  {/* Galeri */}
                  <div>
                    <div className="animate-fade-up relative aspect-[4/5] overflow-hidden bg-subtle">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={product.title}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className={`object-cover ${soldOut ? 'opacity-70 grayscale' : ''}`}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-line-strong">
                          <IconImage className="h-10 w-10" />
                        </div>
                      )}
                    </div>

                    {product.images.length > 1 && (
                      <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto p-1" aria-label="Ürün görselleri">
                        {product.images.map((img, i) => {
                          const active = img.id === image?.id;
                          return (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setImageId(img.id)}
                              aria-label={`Görsel ${i + 1}`}
                              aria-pressed={active}
                              className={`relative h-20 w-16 shrink-0 overflow-hidden transition ${
                                active ? 'ring-2 ring-ink ring-offset-2 ring-offset-canvas' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Bilgiler */}
                  <div className="lg:sticky lg:top-24 lg:self-start">
                    <h1 className="font-display animate-fade-up text-3xl leading-[1.1] font-light md:text-[42px]">{product.title}</h1>
                    <p className="mt-4 text-xl font-medium text-ink">{formatPrice(product.price)}</p>

                    {soldOut && (
                      <p className="mt-6 bg-subtle px-4 py-3 text-sm text-ink-soft">
                        Bu ürün tükendi. Benzer parçalar için koleksiyona göz atabilirsiniz.
                      </p>
                    )}

                    {!soldOut && product.variants.length > 0 && (
                      <fieldset className="mt-8">
                        <legend className="flex w-full items-baseline justify-between text-sm">
                          <span className="text-[11px] font-medium tracking-[0.16em] text-ink uppercase">Yaş grubu</span>
                          {variant && (
                            <span className={variant.quantity <= 2 ? 'text-accent' : 'text-muted'}>
                              {variant.quantity <= 2 ? `Son ${variant.quantity} adet` : `Stokta ${variant.quantity} adet`}
                            </span>
                          )}
                        </legend>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {product.variants.map((v) => {
                            const out = v.quantity === 0;
                            const active = v.id === variantId;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                disabled={out}
                                onClick={() => setVariantId(v.id)}
                                aria-pressed={active}
                                aria-label={`${v.category.name}, ${out ? 'tükendi' : `${v.quantity} adet stokta`}`}
                                className={`flex min-h-14 min-w-24 flex-col items-center justify-center border px-4 py-2 text-sm transition-colors duration-300 ${
                                  out
                                    ? 'cursor-not-allowed border-line text-muted/60 line-through'
                                    : active
                                      ? 'is-selected'
                                      : 'border-line-strong bg-white text-ink hover:border-ink'
                                }`}
                              >
                                <span>{v.category.name}</span>
                                <span
                                  className={`mt-0.5 text-xs no-underline ${
                                    out ? 'text-muted/60' : active ? 'text-white/85' : v.quantity <= 2 ? 'text-accent' : 'text-muted'
                                  }`}
                                >
                                  {out ? 'Tükendi' : `${v.quantity} adet`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    )}

                    {!soldOut && (
                      <div className="mt-8 hidden lg:block">
                        {waLink ? (
                          <>
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-whatsapp btn-lg w-full"
                            >
                              <IconChat className="h-5 w-5" />
                              WhatsApp ile sipariş ver
                            </a>
                            <p className="mt-3 text-center text-xs text-muted">
                              Mesajınız ürün adı{variant ? ' ve seçtiğiniz yaş grubuyla' : 'yla'} hazır açılır.
                            </p>
                          </>
                        ) : (
                          settings !== undefined && (
                            <a href="#iletisim" className="btn btn-primary btn-lg w-full">
                              Sipariş için iletişime geçin
                            </a>
                          )
                        )}
                      </div>
                    )}

                    {product.description && (
                      <div className="mt-10 border-t border-line pt-6">
                        <h2 className="text-sm font-medium text-ink">Ürün hakkında</h2>
                        <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                          {product.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {related.length > 0 && (
                  <section aria-labelledby="diger" className="container-page mt-20">
                    <div className="flex items-end justify-between gap-4 border-t border-line pt-12">
                      <h2 id="diger" className="font-display text-3xl font-light md:text-4xl">
                        Bunlar da hoşunuza gidebilir
                      </h2>
                      <Link href="/" className="shrink-0 text-sm whitespace-nowrap text-ink-soft underline-offset-4 hover:underline">
                        Tümünü gör
                      </Link>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
                      {related.map((p, i) => (
                        <Reveal key={p.id} delay={i * 80}>
                          <ProductCard product={p} />
                        </Reveal>
                      ))}
                    </div>
                  </section>
                )}

                {/* Mobil sabit sipariş çubuğu */}
                {!soldOut && waLink && (
                  <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-ink">{formatPrice(product.price)}</p>
                        {variant && <p className="truncate text-xs text-muted">{variant.category.name}</p>}
                      </div>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp flex-1"
                      >
                        <IconChat className="h-4 w-4" />
                        WhatsApp ile sipariş ver
                      </a>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
      </main>
      <StoreFooter />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page grid gap-8 pt-10 lg:grid-cols-2 lg:gap-16" aria-hidden="true">
      <div className="skeleton aspect-[4/5]" />
      <div className="space-y-4">
        <div className="skeleton h-9 w-3/4" />
        <div className="skeleton h-7 w-1/4" />
        <div className="skeleton mt-8 h-11 w-2/3" />
        <div className="skeleton h-13 w-full" />
      </div>
    </div>
  );
}
