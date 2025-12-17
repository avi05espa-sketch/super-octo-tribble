
"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProduct, getUser, getOrCreateChat } from '@/lib/data';
import type { Product, User } from '@/lib/types';
import { useFirebase, useUser as useAuthUser } from '@/firebase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Phone, Heart, Share2, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function ProductSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
            <Skeleton className="aspect-video w-full h-[400px] md:h-[600px] rounded-lg" />
        </div>
        <div className="flex flex-col gap-6">
            <div>
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/4 mt-4" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <Separator />
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Skeleton className="h-12 w-full" />
               <Skeleton className="h-12 w-full" />
            </div>
        </div>
    </div>
  )
}

export default function ProductPage() {
  const { id } = useParams() as { id: string };
  const { firestore } = useFirebase();
  const { user: currentUser } = useAuthUser();
  const router = useRouter();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    if (!id || !firestore) return;

    const fetchProductAndSeller = async () => {
      setLoading(true);
      const productData = await getProduct(firestore, id);
      
      if (!productData) {
        notFound();
        return;
      }

      setProduct(productData);

      if (productData.sellerId) {
        const sellerData = await getUser(firestore, productData.sellerId);
        if (sellerData) {
          setSeller(sellerData);
        }
      }
      setLoading(false);
    };

    fetchProductAndSeller();
  }, [id, firestore]);

  const handleSendMessage = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Inicia sesión",
        description: "Debes iniciar sesión para enviar un mensaje."
      });
      router.push('/auth');
      return;
    }

    if (!product || !seller) return;
    
    if (currentUser.uid === seller.id) {
        toast({
            variant: "destructive",
            title: "Es tu propio producto",
            description: "No puedes enviarte un mensaje a ti mismo."
        });
        return;
    }

    setIsChatting(true);
    try {
      const chatId = await getOrCreateChat(firestore, currentUser.uid, seller.id, product.id);
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating or getting chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar el chat. Inténtalo de nuevo."
      });
      setIsChatting(false);
    }
  };


  if (loading) {
    return (
       <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
              <Button variant="outline" asChild>
                <Link href="/">← Volver</Link>
              </Button>
            </div>
          </header>
          <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
            <ProductSkeleton />
          </main>
      </div>
    )
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Button variant="outline" asChild>
            <Link href="/">← Volver</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Compartir</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Guardar favorito</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((img, index) => {
                   const placeholder = PlaceHolderImages.find(p => p.imageUrl === img);
                   const imageHint = placeholder?.imageHint || 'product photo';
                  return (
                    <CarouselItem key={index}>
                      <div className="aspect-video relative rounded-lg overflow-hidden border">
                         <Image
                            src={img}
                            alt={`${product.title} - imagen ${index + 1}`}
                            fill
                            className="object-cover w-full h-full"
                            data-ai-hint={imageHint}
                        />
                      </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-3xl lg:text-4xl font-bold font-headline">
                  {product.title}
                </h1>
                <Badge variant={product.condition === 'Nuevo' ? 'default' : 'secondary'}>
                  {product.condition}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-primary mt-2">
                ${product.price.toLocaleString('es-MX')}
              </p>
            </div>

            <p className="text-base text-foreground/80 whitespace-pre-wrap">
              {product.description}
            </p>

            <Separator />

            {seller && (
              <div className="rounded-lg border bg-card p-4">
                <p className="font-semibold text-sm mb-4">Vendido por</p>
                <Link href={`/profile/${seller.id}`} className="flex items-center gap-4 group">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={seller.profilePicture} alt={seller.name} />
                      <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg group-hover:text-primary transition-colors">{seller.name}</p>
                      <p className="text-sm text-muted-foreground">{seller.location}</p>
                    </div>
                </Link>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Button size="lg" className="h-12 text-lg" onClick={handleSendMessage} disabled={isChatting}>
                {isChatting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <MessageCircle className="mr-2 h-6 w-6" />}
                 Enviar mensaje
              </Button>
              <Button size="lg" variant="outline" className="h-12 text-lg">
                <Phone className="mr-2 h-6 w-6" /> Llamar
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
