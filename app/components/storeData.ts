'use client';

import type { Category, Product } from '@/lib/types';

// Aynı sayfadaki bileşenler (hero, kategori kutuları, ürün listesi) tek istekle beslenir.
let productsCache: Promise<Product[] | null> | null = null;
let categoriesCache: Promise<Category[]> | null = null;

export function loadProducts(): Promise<Product[] | null> {
  if (!productsCache) {
    productsCache = fetch('/api/products')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return productsCache;
}

export function loadCategories(): Promise<Category[]> {
  if (!categoriesCache) {
    categoriesCache = fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
  }
  return categoriesCache;
}
