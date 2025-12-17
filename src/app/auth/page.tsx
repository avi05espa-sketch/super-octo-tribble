
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { FirebaseError } from "firebase/app";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, MapPin, UserPlus } from "lucide-react";
import { createUserProfile } from "@/lib/data";

const TIJUANA_COORDS = { latitude: 32.5149, longitude: -117.0382 };
const MAX_DISTANCE_KM = 50; // 50km radius for a wider range

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function LoginForm() {
  const { app } = useFirebase();
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "¡Bienvenido de nuevo!" });
      router.push("/");
    } catch (error) {
      console.error(error);
      let description = "Ocurrió un error inesperado.";
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = "Correo o contraseña incorrectos.";
        }
      }
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="grid gap-4">
      <p className="text-sm text-muted-foreground">Ingresa tus credenciales para acceder a tu cuenta.</p>
      <div className="grid gap-2">
        <Label htmlFor="email-login">Correo Electrónico</Label>
        <Input
          id="email-login"
          type="email"
          placeholder="tu@correo.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="bg-zinc-100 dark:bg-zinc-800"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-login">Contraseña</Label>
        <div className="relative">
          <Input
            id="password-login"
            type={showPassword ? "text" : "password"}
            placeholder="Tu contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="bg-zinc-100 dark:bg-zinc-800 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <Link href="#" className="text-right text-sm text-primary hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Iniciando..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { app } = useFirebase();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLocationVerification = () => {
    setIsVerifyingLocation(true);
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocalización no soportada",
        description: "Tu navegador no soporta la geolocalización.",
      });
      setIsVerifyingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistance(latitude, longitude, TIJUANA_COORDS.latitude, TIJUANA_COORDS.longitude);

        if (distance <= MAX_DISTANCE_KM) {
          setLocationVerified(true);
          toast({ title: "Ubicación verificada", description: "¡Estás en Tijuana!" });
        } else {
          setLocationVerified(false);
          toast({
            variant: "destructive",
            title: "Ubicación no permitida",
            description: "Debes estar en el área de Tijuana para registrarte.",
          });
        }
        setIsVerifyingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          variant: "destructive",
          title: "Error de ubicación",
          description: "No se pudo obtener tu ubicación. Por favor, activa los permisos de ubicación.",
        });
        setIsVerifyingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationVerified) {
       toast({ variant: "destructive", title: "Verificación requerida", description: "Debes verificar tu ubicación." });
       return;
    }
    if (!termsAccepted) {
      toast({ variant: "destructive", title: "Términos no aceptados", description: "Debes aceptar los términos y condiciones." });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });
      
      const userProfileData = {
        name: fullName,
        email: user.email!,
        profilePicture: user.photoURL || `https://picsum.photos/seed/${user.uid}/400/400`,
        location: "Tijuana",
        rating: 0,
        ratingCount: 0,
        favorites: [],
      };
      
      // This function now handles its own permission errors via the emitter.
      await createUserProfile(db, user.uid, userProfileData);

      toast({ title: "¡Cuenta creada!", description: "Tu cuenta ha sido creada exitosamente." });
      router.push("/");
    } catch (error) {
      console.error(error);
      let description = "Ocurrió un error inesperado.";
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          description = "Este correo electrónico ya está en uso.";
        }
      }
      toast({ variant: "destructive", title: "Error en el registro", description });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="grid gap-4">
      <p className="text-sm text-muted-foreground">Regístrate para empezar a comprar y vender.</p>
      <div className="grid gap-2">
        <Label htmlFor="full-name">Nombre</Label>
        <Input id="full-name" placeholder="Tu nombre" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} className="bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email-register">Correo Electrónico</Label>
        <Input id="email-register" type="email" placeholder="tu@correo.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-register">Contraseña</Label>
         <div className="relative">
            <Input id="password-register" type={showPassword ? "text" : "password"} placeholder="Crea una contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="bg-zinc-100 dark:bg-zinc-800 pr-10" />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
        </div>
      </div>
       <div className="grid gap-2">
        <Label htmlFor="location">Ubicación</Label>
        <div className="flex gap-2">
          <div className="relative flex-grow">
             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="location" value="Tijuana" disabled className="pl-8 bg-zinc-100 dark:bg-zinc-800" />
          </div>
          <Button type="button" variant={locationVerified ? "secondary" : "outline"} onClick={handleLocationVerification} disabled={isVerifyingLocation || locationVerified}>
            {isVerifyingLocation ? "Verificando..." : (locationVerified ? "Verificado" : "Verificar")}
          </Button>
        </div>
         <p className="text-xs text-muted-foreground">Debes verificar que estás en Tijuana para crear una cuenta.</p>
      </div>
       <div className="flex items-start space-x-2 pt-2">
        <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
        <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-snug">
          Acepto los{" "}
          <Link href="/terms" className="underline text-primary hover:text-primary/80">
            Términos y Condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacy" className="underline text-primary hover:text-primary/80">
            Política de Privacidad
          </Link>
          .
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || !termsAccepted || !locationVerified}>
        <UserPlus className="mr-2 h-4 w-4" />
        {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
      </Button>
    </form>
  );
}

export default function AuthPage() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'login';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4">
        <div className="mb-8">
            <Logo />
        </div>
      <Tabs defaultValue={defaultTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-200 dark:bg-zinc-800">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
        </TabsList>
        <Card className="mt-4 shadow-md">
             <TabsContent value="login">
                 <CardContent className="pt-6">
                    <LoginForm />
                </CardContent>
            </TabsContent>
            <TabsContent value="register">
                 <CardContent className="pt-6">
                    <RegisterForm />
                </CardContent>
            </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
