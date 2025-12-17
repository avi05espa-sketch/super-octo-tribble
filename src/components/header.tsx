"use client";

import Link from 'next/link';
import { Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
             <Button asChild>
                <Link href="/auth">Iniciar Sesión</Link>
            </Button>
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

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form action="/search" className="w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Buscar en Tijuana Shop..."
              className="w-full pl-10 bg-secondary"
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
           <div className="md:hidden">
             <Button variant="ghost" size="icon" asChild>
                <Link href="/search"><Search className="h-5 w-5"/></Link>
             </Button>
           </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/sell"><PlusCircle className="mr-2 h-4 w-4"/>Vender</Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}