import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <h1>Política de Privacidad</h1>
          <p>
            Tu privacidad es importante para nosotros. Es política de Tijuana Shop respetar tu privacidad con respecto a cualquier información que podamos recopilar de ti a través de nuestra aplicación.
          </p>
          <h2>1. Información que recopilamos</h2>
          <p>
            Solicitamos información personal como tu nombre, correo electrónico y ubicación solo cuando es estrictamente necesario para brindarte un servicio (por ejemplo, para crear tu perfil de usuario o verificar tu ubicación para el registro). La recopilamos por medios justos y legales, con tu conocimiento y consentimiento. También te informamos por qué la recopilamos y cómo se utilizará.
          </p>
          <h2>2. Cómo usamos tu información</h2>
          <p>
            Usamos la información que recopilamos para operar y mantener los servicios de Tijuana Shop, para permitir la comunicación entre usuarios, para procesar transacciones y para personalizar tu experiencia. No compartimos ninguna información de identificación personal públicamente o con terceros, excepto cuando la ley lo exige o para facilitar las funciones principales de la aplicación (como mostrar tu nombre de perfil a otros usuarios).
          </p>
          <h2>3. Geolocalización</h2>
          <p>
            Para registrarte, requerimos acceso a tu geolocalización para verificar que te encuentras en el área de Tijuana. Esta verificación se realiza una sola vez durante el registro y no rastreamos tu ubicación continuamente. El propósito es mantener la naturaleza local de nuestro mercado.
          </p>
          <h2>4. Seguridad</h2>
          <p>
            La seguridad de tu información personal es importante para nosotros. Si bien nos esforzamos por utilizar medios comercialmente aceptables para proteger tu información personal (como la autenticación segura y bases de datos protegidas por reglas de seguridad), ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro.
          </p>

          <p><em>Última actualización: {lastUpdated}</em></p>
        </div>
      </main>
    </div>
  );
}
