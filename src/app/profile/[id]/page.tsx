
"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { getProducts, getUser } from '@/lib/data';
import type { Product, User } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MapPin } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import { StarRating } from '@/components/star-rating';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileSkeleton() {
  return (
     <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-card p-8 rounded-lg border">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-3 text-center md:text-left">
                <Skeleton className="h-9 w-48 mx-auto md:mx-0" />
                <Skeleton className="h-5 w-32 mx-auto md:mx-0" />
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-4 w-40 mx-auto md:mx-0" />
            </div>
        </div>
       <div className="mt-12">
        <Skeleton className="h-7 w-52 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                 <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { id } = useParams() as { id: string };
  const { firestore } = useFirebase();

  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !firestore) return;

    const fetchProfileData = async () => {
      setLoading(true);
      const [userData, productData] = await Promise.all([
          getUser(firestore, id),
          getProducts(firestore, { sellerId: id })
      ]);
      
      if (!userData) {
        notFound();
        return;
      }
      
      setUser(userData);
      setProducts(productData);
      setLoading(false);
    };

    fetchProfileData();
  }, [id, firestore]);

  if (loading) {
    return (
       <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
              <Button variant="outline" asChild>
                <Link href="/">← Volver</Link>
              </Button>
            </div>
          </header>
          <main>
            <ProfileSkeleton />
          </main>
      </div>
    )
  }

  if (!user) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900 font-body">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Button variant="outline" asChild>
            <Link href="/">← Volver</Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-card p-8 rounded-lg border">
            <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={user.profilePicture} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold font-headline">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mt-2">
                    <StarRating rating={user.rating || 0} />
                    <span className="text-sm">({user.ratingCount || 0} reseñas)</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground mt-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location || 'Tijuana'}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                    </div>
                </div>
                 <p className="text-sm text-muted-foreground mt-2">Miembro desde {new Date(user.createdAt?.toDate()).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}</p>
            </div>
        </div>

        <div className="mt-12">
            <h2 className="text-2xl font-bold tracking-tighter mb-6">{products.length} Anuncios Publicados</h2>
            {products.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ): (
                <div className="flex flex-col items-center justify-center h-64 border-dashed border-2 rounded-lg text-center p-6">
                    <p className="text-lg text-muted-foreground">Este usuario no tiene productos a la venta en este momento.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

    