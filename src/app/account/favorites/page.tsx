
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase';
import { getFavoriteProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductCard } from '@/components/product-card';
import { Loader2, Heart } from 'lucide-react';


export default function MyFavoritesPage() {
    const { firestore } = useFirebase();
    const { user, loading: userLoading } = useUser();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading) return;
        if (!user) {
            router.replace('/auth');
            return;
        }

        const fetchUserProducts = async () => {
            if (firestore && user) {
                const userProducts = await getFavoriteProducts(firestore, user.uid);
                setProducts(userProducts);
                setLoading(false);
            }
        };

        fetchUserProducts();

    }, [user, userLoading, firestore, router]);


    const isLoading = loading || userLoading;

    return (
         <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900">
             <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <Button variant="outline" asChild>
                        <Link href="/">← Volver</Link>
                    </Button>
                    <h1 className="text-xl font-bold font-headline">Mis Favoritos</h1>
                    <div className="w-24"></div>
                </div>
            </header>
            <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
                 {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center h-96 text-center p-6 border-dashed">
                        <CardHeader>
                            <div className="mx-auto bg-muted rounded-full p-4">
                                <Heart className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                            <CardTitle className="mt-6 text-2xl font-semibold">No tienes favoritos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mt-2 text-md text-muted-foreground">
                                Haz clic en el corazón de un producto para guardarlo aquí.
                            </p>
                            <Button asChild className="mt-6">
                                <Link href="/">Explorar productos</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
         </div>
    )
}
