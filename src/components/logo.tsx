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
        <path d="M6 35C6 35 12.7273 6.5 20 6.5C27.2727 6.5 34 35 34 35" stroke="hsl(var(--foreground))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 18C21.1046 18 22 17.1046 22 16C22 14.8954 21.1046 14 20 14C18.8954 14 18 14.8954 18 16C18 17.1046 18.8954 18 20 18Z" fill="hsl(var(--foreground))"/>
      </svg>
      <span className="text-xl font-bold text-foreground hidden sm:inline-block">
        Tijuana Shop
      </span>
    </Link>
  );
}
