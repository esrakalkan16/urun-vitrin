import Link from 'next/link';

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-ink md:text-2xl"
          aria-label="L'Atelier Enfant — Ana sayfa"
        >
          L&rsquo;Atelier Enfant
        </Link>

        <nav aria-label="Ana gezinti" className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-full px-3 py-2 text-ink-soft transition-colors hover:bg-subtle hover:text-ink">
            Koleksiyon
          </Link>
          <a
            href="#iletisim"
            className="rounded-full px-3 py-2 text-ink-soft transition-colors hover:bg-subtle hover:text-ink"
          >
            İletişim
          </a>
        </nav>
      </div>
    </header>
  );
}
