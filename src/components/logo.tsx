import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex flex-col items-start" prefetch={false}>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-blue-800 dark:text-blue-400 tracking-tight">
          Tijuana
        </span>
        <span className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 tracking-tight">
          Shop
        </span>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Tu marketplace local en línea
      </p>
    </Link>
  );
}
