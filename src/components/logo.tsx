import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
       <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
      >
        <rect width="40" height="40" rx="8" fill="hsl(var(--primary))"/>
        <path d="M12 12H20V16H24V28H20V24H12V28H8V12H12Z" fill="hsl(var(--background))"/>
        <path d="M20 12H28V20H24V16H20V12Z" fill="hsl(var(--accent))"/>
      </svg>

      <span className="text-xl font-bold text-foreground hidden sm:inline-block">
        Tijuana Shop
      </span>
    </Link>
  );
}
