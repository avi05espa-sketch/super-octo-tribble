
"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { Input } from './ui/input';
import { Loader2, Search } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import { interpretSearchQuery } from '@/ai/flows/search-flow';

function UserNav() {
    const { user, loading } = useUser();
    const auth = getAuth();
    const router = useRouter();

    if (loading) {
        return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
    }

    if (!user) {
        return (
             <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/auth">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                    <Link href="/auth?tab=register">Crear Cuenta</Link>
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
                <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.uid}`} className="w-full">Perfil</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/account/messages" className="w-full">Mensajes</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/listings" className="w-full">Mis Artículos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                     <Link href="/account/favorites" className="w-full">Favoritos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                    signOut(auth);
                    router.push('/');
                }}>
                    Cerrar sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState(searchParams.get('search') || '');

    useEffect(() => {
        setQuery(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSearching(true);
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get('search') as string;
        
        const params = new URLSearchParams();

        if (searchQuery) {
            try {
                const interpretation = await interpretSearchQuery({ query: searchQuery });
                
                if(interpretation.searchTerm) params.set('search', interpretation.searchTerm);
                if(interpretation.category) params.set('categories', interpretation.category);
                if(interpretation.condition) params.set('conditions', interpretation.condition);
                if(interpretation.minPrice) params.set('minPrice', interpretation.minPrice.toString());
                if(interpretation.maxPrice) params.set('maxPrice', interpretation.maxPrice.toString());

            } catch (error) {
                console.error("AI search interpretation failed, falling back to basic search:", error);
                params.set('search', searchQuery);
            }
        }
        
        const newUrl = `/?${params.toString()}`;
        if (pathname === '/' ) {
             router.replace(newUrl, { scroll: false });
        } else {
             router.push(newUrl);
        }
        setIsSearching(false);
    }

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-md hidden md:flex">
          {isSearching ? (
             <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input 
            name="search"
            placeholder="Busca con IA: 'iPhone nuevo por menos de 10000'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 w-full bg-zinc-100 dark:bg-zinc-800 focus:bg-background"
            disabled={isSearching}
          />
        </form>
    );
}


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="md:hidden">
            <MobileSheet />
          </div>
          <Logo />
        </div>
        
        <div className="flex-1 flex justify-center px-4">
            <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
