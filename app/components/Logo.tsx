// Veliaht logosu: tacın ortasındaki tepe bir askı kancasına dönüşür.
type CrownProps = { className?: string; hook?: boolean };

export function CrownMark({ className = 'h-10 w-auto', hook = true }: CrownProps) {
  return (
    <svg viewBox="0 0 120 118" aria-hidden="true" className={className}>
      {hook && (
        <path
          d="M60 38V29q0-5 4.5-8.5C68 18 70 15.5 70 11.5a10 10 0 0 0-20 0"
          fill="none"
          stroke="var(--color-camel)"
          strokeWidth={5}
          strokeLinecap="round"
        />
      )}
      <path d="M0 100 9 49l27 24 24-36 25 36 26-24 9 51Z" fill="currentColor" />
      <circle cx="9" cy="45" r="6" fill="var(--color-camel)" />
      <circle cx="111" cy="45" r="6" fill="var(--color-camel)" />
      <rect x="0" y="106" width="120" height="11" rx="3" fill="currentColor" />
    </svg>
  );
}

type LogoProps = {
  /** light: krem zemin üstünde lacivert, dark: lacivert zemin üstünde krem */
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  tagline?: string | null;
  crown?: boolean;
  className?: string;
};

const sizes = {
  sm: { crown: 'h-6', word: 'text-xl', tag: 'text-[8px] tracking-[0.32em]' },
  md: { crown: 'h-8 md:h-9', word: 'text-2xl md:text-[28px]', tag: 'text-[8px] tracking-[0.36em] md:text-[9px]' },
  lg: { crown: 'h-12', word: 'text-4xl', tag: 'text-[10px] tracking-[0.4em]' },
};

export function Logo({ tone = 'light', size = 'md', tagline = 'Kids · Erkek çocuk giyim', crown = true, className = '' }: LogoProps) {
  const s = sizes[size];
  const main = tone === 'dark' ? 'text-cream' : 'text-navy';
  const sub = tone === 'dark' ? 'text-camel' : 'text-kahve';

  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      {crown && <CrownMark className={`${s.crown} w-auto ${main}`} />}
      <span className={`font-serif leading-none font-semibold tracking-[0.06em] ${s.word} ${main} ${crown ? 'mt-1.5' : ''}`}>
        VELİAHT
      </span>
      {tagline && <span className={`mt-1.5 font-medium whitespace-nowrap uppercase ${s.tag} ${sub}`}>{tagline}</span>}
    </span>
  );
}
