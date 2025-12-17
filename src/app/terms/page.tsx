import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Button variant="outline" asChild>
            <Link href="/">← Volver al inicio</Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Términos y Condiciones</h1>
          <p>
            Bienvenido a Tijuana Shop. Estos términos y condiciones describen las reglas y regulaciones para el uso de la aplicación de Tijuana Shop.
          </p>
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar esta aplicación, asumimos que aceptas estos términos y condiciones en su totalidad. No continúes usando Tijuana Shop si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.
          </p>
          <h2>2. Publicaciones de Productos</h2>
          <p>
            Como usuario, eres el único responsable del contenido que publicas. Al publicar un artículo, garantizas que la información proporcionada es precisa, veraz y no infringe ninguna ley o derecho de terceros. Está prohibido publicar artículos ilegales, peligrosos o que no poseas. Nos reservamos el derecho de eliminar, sin previo aviso, cualquier publicación que consideremos inapropiada o que viole estos términos.
          </p>
          <h2>3. Conducta del Usuario</h2>
          <p>
            No debes usar esta aplicación de ninguna manera que cause, o pueda causar, daño a la misma o menoscabo de su disponibilidad o accesibilidad. Se prohíbe el uso de esta aplicación para cualquier actividad que sea ilegal, fraudulenta o dañina. El acoso, el spam y cualquier forma de comportamiento abusivo hacia otros usuarios no serán tolerados y pueden resultar en la suspensión o eliminación de tu cuenta.
          </p>
           <h2>4. Limitación de Responsabilidad</h2>
          <p>
            Tijuana Shop es una plataforma que conecta a compradores y vendedores. No somos parte de ninguna transacción entre usuarios. No garantizamos la calidad, seguridad o legalidad de los artículos publicados. Cualquier disputa que surja de una transacción debe resolverse directamente entre el comprador y el vendedor.
          </p>
          
          <p><em>Última actualización: {lastUpdated}</em></p>
        </div>
      </main>
    </div>
  );
}
