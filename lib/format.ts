import type { ProductImage, Variant } from './types';

/** 1250 → "₺1.250", 249.9 → "₺249,90" */
export function formatPrice(value: string | number): string {
  const n = Number(value);
  const hasFraction = Math.round(n * 100) % 100 !== 0;
  return n.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  });
}

export function getCover<T extends Pick<ProductImage, 'isCover'>>(images: T[] | undefined): T | undefined {
  if (!images || images.length === 0) return undefined;
  return images.find((i) => i.isCover) ?? images[0];
}

export function totalStock(variants: Pick<Variant, 'quantity'>[] | undefined): number {
  return (variants ?? []).reduce((sum, v) => sum + v.quantity, 0);
}
