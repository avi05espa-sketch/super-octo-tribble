"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { MobileSheet } from './mobile-sheet';
import { useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getAuth, signOut } from 'firebase/auth';

function UserNav() {
    const { user, loading } = useUser();
    const auth = getAuth();

    if (loading) {
        return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
    }

    if (!user) {
        return (
             <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/auth">Iniciar Sesión</Link>
                </Button>
                <Button asChild className="bg-red-500 hover:bg-red-600">
                    <Link href="/auth">Crear Cuenta</Link>
                </Button>
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuario'} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href="/profile" className="w-full">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href="/account/listings" className="w-full">Mis Artículos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                     <Link href="/account/favorites" className="w-full">Favoritos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut(auth)}>
                    Cerrar sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="md:hidden">
            <MobileSheet />
          </div>
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
