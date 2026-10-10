'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { formatPrice, getCover } from '@/lib/format';
import { loadProducts } from './storeData';
import { CrownMark } from './Logo';

export function Hero() {
  const [slides, setSlides] = useState<Product[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    loadProducts().then((list) => {
      if (alive && list) setSlides(list.filter((p) => getCover(p.images)).slice(0, 4));
    });
    return () => {
      alive = false;
    };
  }, []);

  // Ürün fotoğrafları arasında yumuşak geçiş
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section className="relative overflow-hidden bg-navy text-cream">
      <CrownMark className="pointer-events-none absolute -bottom-12 -left-16 h-72 w-auto text-cream opacity-[0.05]" />
      <div className="container-page relative grid items-center gap-10 py-12 md:grid-cols-2 md:gap-16 md:py-20">
        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="eyebrow animate-fade-up text-camel">Yeni sezon · Küçük beyefendiler için</p>
          <h1 className="font-display animate-fade-up mt-5 text-[40px] leading-[1.08] text-cream [animation-delay:100ms] md:text-[64px]">
            Her küçük veliahta
            <br />
            <span className="text-camel italic">zamansız</span> bir şıklık
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-cream/75 [animation-delay:200ms] md:mx-0">
            Gömlekten yeleğe, özenle seçilmiş erkek çocuk kıyafetleri. Beğendiğiniz ürünü WhatsApp&rsquo;tan sorun,
            bedeninizi hemen ayıralım.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col items-center gap-4 [animation-delay:300ms] sm:flex-row md:items-start">
            <a href="#koleksiyon" className="btn btn-camel btn-lg">
              Alışverişe başla
            </a>
            <a href="#siparis" className="btn btn-ghost text-cream/80 hover:text-cream">
              Nasıl sipariş verilir?
            </a>
          </div>
        </div>

        {/* Ürün fotoğrafı slaytı */}
        <div className="animate-fade-up order-1 [animation-delay:150ms] md:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden bg-white/10 outline outline-1 outline-offset-8 outline-camel/40 md:max-w-md">
            {slides.map((p, i) => {
              const cover = getCover(p.images)!;
              return (
                <Image
                  key={p.id}
                  src={cover.url}
                  alt={i === index ? p.title : ''}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 768px) 90vw, 440px"
                  className={`object-cover transition-[opacity,transform] duration-[1400ms] ease-out ${
                    i === index ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
                  }`}
                />
              );
            })}
            {slides.length === 0 && <div className="absolute inset-0 animate-pulse bg-white/10" />}

            {current && (
              <Link
                href={`/urun/${current.id}`}
                className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 bg-cream/95 px-4 py-3 text-sm text-navy backdrop-blur transition-colors hover:bg-cream"
              >
                <span className="truncate">{current.title}</span>
                <span className="shrink-0 font-medium">{formatPrice(current.price)}</span>
              </Link>
            )}
          </div>

          {slides.length > 1 && (
            <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Öne çıkan ürünler">
              {slides.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`${i + 1}. ürün`}
                  onClick={() => setIndex(i)}
                  className={`h-1 transition-all duration-500 ${i === index ? 'w-8 bg-camel' : 'w-4 bg-cream/30 hover:bg-cream/60'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
