import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full border-t bg-secondary">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Tijuana Shop. Todos los derechos reservados.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            href="/terms"
            className="text-sm hover:underline underline-offset-4"
            prefetch={false}
          >
            Términos y condiciones
          </Link>
          <Link
            href="/privacy"
            className="text-sm hover:underline underline-offset-4"
            prefetch={false}
          >
            Política de privacidad
          </Link>
        </nav>
      </div>
    </footer>
  );
}
