import { Suspense } from 'react';
import { StoreHeader } from './components/StoreHeader';
import { StoreFooter } from './components/StoreFooter';
import ProductGrid, { ProductGridSkeleton } from './components/ProductGrid';
import { Hero } from './components/Hero';
import { CategoryTiles } from './components/CategoryTiles';
import { Reveal } from './components/Reveal';

const promises = [
  { title: 'Doğal kumaşlar', text: 'Organik pamuk, keten ve yumuşak trikolar' },
  { title: 'Kolay sipariş', text: 'WhatsApp’tan tek mesajla bedeninizi ayırın' },
  { title: 'Anlık stok', text: 'Her üründe yaş grubuna göre kalan adet' },
];

const steps = [
  { title: 'Ürünü seçin', text: 'Ürün sayfasında çocuğunuza uygun yaş grubunu ve kalan adedi görün.' },
  { title: 'WhatsApp’tan yazın', text: 'Mesajınız ürün adı ve yaş grubuyla hazır açılır, göndermeniz yeterli.' },
  { title: 'Birlikte netleştirelim', text: 'Ödeme ve teslimatı sizinle birebir konuşup ürünü hemen ayırıyoruz.' },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />

      <main className="flex-1">
        <Hero />

        {/* Söz şeridi */}
        <section aria-label="Neden L'Atelier Enfant" className="border-b border-line">
          <ul className="container-page grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
            {promises.map((p) => (
              <li key={p.title} className="px-2 py-5 text-center md:py-7">
                <p className="text-[11px] font-medium tracking-[0.16em] uppercase">{p.title}</p>
                <p className="mt-1 text-sm font-light text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <CategoryTiles />

        <section id="koleksiyon" className="scroll-mt-20">
          <Suspense
            fallback={
              <div className="container-page pt-24">
                <ProductGridSkeleton />
              </div>
            }
          >
            <ProductGrid />
          </Suspense>
        </section>

        {/* Nasıl sipariş verilir */}
        <section id="siparis" aria-labelledby="nasil" className="mt-20 scroll-mt-20 bg-mint md:mt-28">
          <div className="container-page py-16 md:py-24">
            <Reveal className="text-center">
              <p className="eyebrow text-ink-soft">Sipariş</p>
              <h2 id="nasil" className="font-display mt-2 text-3xl font-light md:text-4xl">
                Nasıl sipariş verilir?
              </h2>
            </Reveal>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 100} className="text-center">
                  <span className="font-display mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-light">
                    {i + 1}
                  </span>
                  <p className="mt-5 text-[11px] font-medium tracking-[0.16em] uppercase">{s.title}</p>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed font-light text-ink-soft">{s.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
