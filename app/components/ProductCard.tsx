import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice, getCover, totalStock } from '@/lib/format';
import { IconImage } from './icons';

export function ProductCard({ product }: { product: Product }) {
  const cover = getCover(product.images);
  const stock = totalStock(product.variants);
  const sizes = product.variants.filter((v) => v.quantity > 0).map((v) => `${v.category.name}: ${v.quantity}`);

  return (
    <Link href={`/urun/${product.id}`} className="group block focus-visible:outline-offset-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-subtle">
        {cover ? (
          <Image
            src={cover.url}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-line-strong">
            <IconImage className="h-8 w-8" />
          </div>
        )}

        {stock > 0 && stock <= 2 && (
          <span className="absolute top-3 left-3 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-medium text-accent">
            Son {stock} adet
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 text-sm leading-snug text-ink decoration-line-strong underline-offset-4 group-hover:underline">
          {product.title}
        </h3>
        <p className="text-sm font-semibold text-ink">{formatPrice(product.price)}</p>
        {stock > 0 && <p className="text-xs text-ink-soft">Stokta {stock} adet</p>}
        {sizes.length > 0 && <p className="truncate text-xs text-muted">{sizes.join(' · ')}</p>}
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton aspect-[4/5] rounded-xl" />
      <div className="skeleton mt-3 h-4 w-4/5" />
      <div className="skeleton mt-2 h-4 w-1/3" />
    </div>
  );
}
