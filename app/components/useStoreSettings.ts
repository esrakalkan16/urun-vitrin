'use client';

import { useEffect, useState } from 'react';
import type { StoreSettings } from '@/lib/types';

// Aynı sayfada birden çok bileşen ayarları istese de tek istek atılır.
let cache: Promise<StoreSettings | null> | null = null;

function loadSettings(): Promise<StoreSettings | null> {
  if (!cache) {
    cache = fetch('/api/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return cache;
}

/** undefined = yükleniyor, null = alınamadı */
export function useStoreSettings(): StoreSettings | null | undefined {
  const [settings, setSettings] = useState<StoreSettings | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadSettings().then((s) => {
      if (alive) setSettings(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}
