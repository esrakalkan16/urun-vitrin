import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice, getCover, totalStock } from '@/lib/format';
import { IconImage } from './icons';

export function ProductCard({ product }: { product: Product; index?: number }) {
  const cover = getCover(product.images);
  // Üstüne gelince ikinci fotoğraf görünür
  const second = product.images.find((img) => img.id !== cover?.id);
  const stock = totalStock(product.variants);
  const sizes = product.variants.filter((v) => v.quantity > 0).map((v) => `${v.category.name}: ${v.quantity}`);

  return (
    <Link href={`/urun/${product.id}`} className="group block focus-visible:outline-offset-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-subtle">
        {cover ? (
          <>
            <Image
              src={cover.url}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.03] ${
                second ? 'group-hover:opacity-0' : ''
              }`}
            />
            {second && (
              <Image
                src={second.url}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="scale-[1.03] object-cover opacity-0 transition-[opacity,transform] duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-line-strong">
            <IconImage className="h-8 w-8" />
          </div>
        )}

        {stock > 0 && stock <= 2 && (
          <span className="absolute top-3 left-3 bg-white px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-accent uppercase">
            Son {stock} adet
          </span>
        )}

        <span className="absolute inset-x-3 bottom-3 translate-y-2 bg-white/95 py-2.5 text-center text-[10px] font-medium tracking-[0.16em] uppercase opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          İncele
        </span>
      </div>

      <div className="mt-4 space-y-1 text-center">
        <h3 className="line-clamp-2 text-sm leading-snug font-light text-ink">{product.title}</h3>
        <p className="text-sm font-medium text-ink">{formatPrice(product.price)}</p>
        {stock > 0 && <p className="text-[11px] text-muted">Stokta {stock} adet</p>}
        {sizes.length > 0 && <p className="truncate text-[11px] text-muted/80">{sizes.join(' · ')}</p>}
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton aspect-[4/5]" />
      <div className="skeleton mx-auto mt-4 h-3.5 w-3/4" />
      <div className="skeleton mx-auto mt-2 h-3.5 w-1/4" />
    </div>
  );
}
