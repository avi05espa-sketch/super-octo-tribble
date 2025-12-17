import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
       <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
      >
        <rect width="32" height="32" rx="8" fill="hsl(var(--background))" />
        <path
          d="M19.9984 10.4L18.3317 7.06667C18.1317 6.66667 17.5984 6.66667 17.3984 7.06667L15.7317 10.4H19.9984Z"
          fill="hsl(var(--primary))"
        />
        <path
          d="M12 10.4L13.6667 7.06667C13.8667 6.66667 14.4 6.66667 14.6 7.06667L16.2667 10.4H12Z"
          fill="#38BDF8"
        />
        <path
          d="M19.333 13.8667H22.4C22.8 13.8667 23.0667 14.2667 22.9333 14.6667L20.2667 22.9333C20.0667 23.4667 19.5333 23.8667 18.9333 23.8667H12.5333C11.9333 23.8667 11.4 23.4667 11.2 22.9333L8.53333 14.6667C8.4 14.2667 8.66667 13.8667 9.06667 13.8667H12.1333L15.7333 21.0667C15.8 21.2 16.0667 21.2 16.1333 21.0667L19.333 13.8667Z"
          fill="#34D399"
        />
        <path
          d="M16 11.4667L17.8667 15.2C18 15.4667 17.7333 15.8667 17.4667 15.8667H14.5333C14.2667 15.8667 14 15.4667 14.1333 15.2L16 11.4667Z"
          fill="#FDBA74"
        />
      </svg>
      <span className="text-xl font-bold font-headline text-foreground hidden sm:inline-block">
        Tijuana Shop
      </span>
    </Link>
  );
}