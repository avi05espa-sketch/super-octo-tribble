import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <div className="bg-primary rounded-md p-2 flex items-center justify-center">
        <svg
          className="h-6 w-6 text-primary-foreground"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <path d="M9 9h3v6" />
          <path d="M15 9h-3" />
        </svg>
      </div>
      <span className="text-xl font-bold font-headline text-foreground hidden sm:inline-block">
        Tijuana Marketplace
      </span>
    </Link>
  );
}
