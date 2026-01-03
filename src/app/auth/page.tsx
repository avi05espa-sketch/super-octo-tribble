
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleIcon } from './_components/google-icon';
import { AuthForm } from './_components/auth-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function AuthPageComponent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
      <Tabs defaultValue={defaultTab} className="w-full max-w-md">
        <Card className="shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Accede a tu Cuenta</CardTitle>
            <CardDescription>Usa tu correo o proveedor preferido para continuar</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <AuthForm mode="login" />
            </TabsContent>
            <TabsContent value="register">
                <AuthForm mode="register" />
            </TabsContent>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-pink-600 px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
                  <GoogleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Google</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </main>
  );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <AuthPageComponent />
        </Suspense>
    )
}
