import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" prefetch={false}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10"
      >
        <path d="M60 120C93.1371 120 120 93.1371 120 60C120 26.8629 93.1371 0 60 0V60C26.8629 60 0 86.8629 0 120H60Z" fill="#1E3A8A"/>
        <path d="M0 60C0 26.8629 26.8629 0 60 0V120C26.8629 120 0 93.1371 0 60Z" fill="#14B8A6"/>
        <path d="M30 110V70H50V110H30Z" fill="#EC4899"/>
        <path d="M40 70L35 60H55L50 70H40Z" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M20 110V80H35V110H20Z" fill="#14B8A6"/>
        <path d="M27.5 80L22.5 70H37.5L32.5 80H27.5Z" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M50 110L55 75H110L100 110H50Z" fill="#FBBF24"/>
        <path d="M50 110V70H110V80H100V110H50Z" fill="#FBBF24"/>
        <path d="M65 85H75V95H65V85Z" fill="#1E3A8A"/>
        <path d="M85 85H95V95H85V85Z" fill="#1E3A8A"/>
        <path d="M40 85H50V95H40V85Z" fill="#EC4899"/>
      </svg>

      <div className="flex flex-col">
        <span className="text-xl font-bold -mb-1">
          <span style={{color: "#1E3A8A"}}>Tijuana</span> <span style={{color: "#FBBF24"}}>Shop</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Tu marketplace local en línea
        </span>
      </div>
    </Link>
  );
}
