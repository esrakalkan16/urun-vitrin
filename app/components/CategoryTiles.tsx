'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/types';
import { loadCategories } from './storeData';
import { Reveal } from './Reveal';

const tones = ['bg-peach', 'bg-mint', 'bg-sky', 'bg-butter', 'bg-lilac'];

export function CategoryTiles() {
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadCategories().then((c) => alive && setCategories(c));
    return () => {
      alive = false;
    };
  }, []);

  if (categories && categories.length === 0) return null;

  return (
    <section id="yas-gruplari" className="container-page scroll-mt-24 pt-16 md:pt-24">
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Yaşa göre alışveriş</p>
          <h2 className="font-display mt-2 text-3xl font-light md:text-4xl">Hangi yaş için bakıyorsunuz?</h2>
        </div>
      </Reveal>

      <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:px-0 lg:grid-cols-6">
        {(categories ?? Array.from({ length: 6 }, (_, i) => ({ id: String(i), name: '' }))).map((cat, i) =>
          categories ? (
            <Reveal key={cat.id} delay={(i % 6) * 60} className="shrink-0 snap-start">
              <Link
                href={`/?kategori=${encodeURIComponent(cat.name)}#koleksiyon`}
                scroll={false}
                onClick={() => document.getElementById('koleksiyon')?.scrollIntoView({ behavior: 'smooth' })}
                className={`group flex aspect-square w-32 flex-col justify-between p-4 md:w-auto ${tones[i % tones.length]}`}
              >
                <span className="font-display text-xl leading-tight font-light md:text-2xl">{cat.name}</span>
                <span className="text-[10px] tracking-[0.16em] text-ink-soft uppercase">
                  Ürünleri gör
                  <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </Reveal>
          ) : (
            <div key={cat.id} className="skeleton aspect-square w-32 shrink-0 md:w-auto" />
          ),
        )}
      </div>
    </section>
  );
}
