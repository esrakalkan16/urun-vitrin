import { Suspense } from 'react';
import { StoreHeader } from './components/StoreHeader';
import { StoreFooter } from './components/StoreFooter';
import ProductGrid, { ProductGridSkeleton } from './components/ProductGrid';

const steps = [
  { title: 'Beğendiğiniz ürünü seçin', text: 'Ürün sayfasında çocuğunuza uygun yaş grubunu işaretleyin.' },
  { title: 'WhatsApp’tan yazın', text: 'Mesajınız ürün adı ve yaş grubuyla hazır gelir, göndermeniz yeterli.' },
  { title: 'Birlikte netleştirelim', text: 'Stok, ödeme ve teslimatı sizinle birebir konuşup ürünü ayırıyoruz.' },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />

      <main className="flex-1 pb-16 md:pb-24">
        {/* Giriş */}
        <section className="container-page pt-12 pb-10 md:pt-20 md:pb-14">
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Butik çocuk gardırobu</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] text-ink md:text-6xl">
            Yumuşak dokular, <em className="text-accent">özenli</em> seçimler.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Organik pamuk, keten ve trikodan parçalar. Beğendiğiniz ürünü WhatsApp üzerinden sorun, bedeninizi
            hemen ayıralım.
          </p>
        </section>

        <Suspense
          fallback={
            <div className="container-page border-t border-line py-10">
              <ProductGridSkeleton />
            </div>
          }
        >
          <ProductGrid />
        </Suspense>

        {/* Nasıl sipariş verilir */}
        <section aria-labelledby="nasil" className="container-page pt-8 pb-4 md:pt-12">
          <div className="rounded-2xl bg-subtle px-6 py-10 md:px-12 md:py-12">
            <h2 id="nasil" className="font-serif text-2xl text-ink md:text-3xl">
              Nasıl sipariş verilir?
            </h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="font-serif text-3xl text-accent">{i + 1}</span>
                  <p className="mt-2 font-medium text-ink">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
