
"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  Car,
  Smartphone,
  Home as HomeIcon,
  Shirt,
  Blocks,
  Plus,
  Loader2,
} from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { Header } from "@/components/header";
import { getProducts, getCategories } from "@/lib/data";
import type { Category, Product } from "@/lib/types";
import { useFirebase } from "@/firebase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const iconMap: { [key: string]: React.ElementType } = {
  Autos: Car,
  Electrónica: Smartphone,
  Hogar: HomeIcon,
  Ropa: Shirt,
  Otros: Blocks,
};

const FilterSection = ({ 
    categories,
}: { 
    categories: Category[],
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [localPrice, setLocalPrice] = useState(Number(searchParams.get('maxPrice') || '10000'));
    
    useEffect(() => {
        setLocalPrice(Number(searchParams.get('maxPrice') || '10000'));
    }, [searchParams]);


    const handleCheckedChange = (type: 'categories' | 'conditions', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentValues = params.getAll(type);
        
        if (currentValues.includes(value)) {
            const newValues = currentValues.filter(v => v !== value);
            params.delete(type);
            newValues.forEach(v => params.append(type, v));
        } else {
            params.append(type, value);
        }
        router.push(`/?${params.toString()}`, { scroll: false });
    };
    
    const handlePriceCommit = (values: number[]) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('maxPrice', values[0].toString());
        router.push(`/?${params.toString()}`, { scroll: false });
    }

    const selectedCategories = searchParams.getAll('categories');
    const selectedConditions = searchParams.getAll('conditions');


    return (
      <aside className="w-full md:w-1/4 lg:w-1/5 bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4 hidden md:block">Filtros</h2>
        <Accordion type="multiple" defaultValue={['category', 'condition', 'price']} className="w-full">
          <AccordionItem value="category">
            <AccordionTrigger className="text-md font-semibold">Categoría</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-3">
                {categories.map((cat) => (
                     <div key={cat.id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`cat-${cat.id}`} 
                            checked={selectedCategories.includes(cat.id)}
                            onCheckedChange={() => handleCheckedChange('categories', cat.id)}
                        />
                        <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer text-sm">{cat.name}</Label>
                    </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="condition">
            <AccordionTrigger className="text-md font-semibold">Condición</AccordionTrigger>
            <AccordionContent>
               <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cond-new" 
                    checked={selectedConditions.includes('Nuevo')}
                    onCheckedChange={() => handleCheckedChange('conditions', 'Nuevo')}
                    />
                  <Label htmlFor="cond-new" className="cursor-pointer text-sm">Nuevo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cond-used"
                    checked={selectedConditions.includes('Usado')}
                    onCheckedChange={() => handleCheckedChange('conditions', 'Usado')}
                  />
                  <Label htmlFor="cond-used" className="cursor-pointer text-sm">Usado</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="price">
            <AccordionTrigger className="text-md font-semibold">Precio</AccordionTrigger>
            <AccordionContent>
               <div className="space-y-4 pt-2">
                    <Slider
                        defaultValue={[10000]}
                        value={[localPrice]}
                        max={10000}
                        step={100}
                        onValueChange={(values) => setLocalPrice(values[0])}
                        onValueCommit={handlePriceCommit}
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>$0</span>
                         <div className="flex items-center gap-2">
                            <span>hasta</span>
                            <Input 
                                type="text"
                                value={`$${localPrice.toLocaleString()}`}
                                readOnly
                                className="w-24 h-8 text-center"
                            />
                        </div>
                    </div>
               </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </aside>
    );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-card rounded-lg overflow-hidden border">
          <Skeleton className="aspect-square w-full" />
          <div className="p-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-6 w-1/2 mt-1" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}


export default function Home() {
  const { firestore } = useFirebase();
  const searchParams = useSearchParams();
  const categories = useMemo(() => getCategories(), []);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      
      const searchOptions = {
        searchTerm: params.get('search') || undefined,
        categories: params.getAll('categories'),
        conditions: params.getAll('conditions'),
        minPrice: Number(params.get('minPrice')) || undefined,
        maxPrice: Number(params.get('maxPrice')) || undefined,
      };

      const fetchedProducts = await getProducts(firestore, searchOptions);
      setProducts(fetchedProducts);
      setIsLoading(false);
    };

    if (firestore) {
        fetchProducts();
    }
  }, [firestore, searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full bg-card border-b">
           <div className="container mx-auto px-4 md:px-6">
             <div className="relative h-[300px] md:h-[400px] my-8">
                <div className="container mx-auto px-4 md:px-6 h-full relative z-30">
                  <div className="flex flex-col justify-center h-full max-w-xl">
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                        El marketplace local de <span className="text-primary">Tijuana</span>
                      </h1>
                      <p className="text-lg md:text-xl mt-4 text-muted-foreground">
                        Compra, vende y descubre artículos únicos en tu comunidad.
                      </p>
                      <Button asChild size="lg" className="mt-8 w-fit">
                        <Link href="/sell">
                           <Plus className="mr-2 h-5 w-5" /> Vender ahora
                        </Link>
                      </Button>
                  </div>
                </div>
                 <div className="absolute inset-0 z-0">
                    <Image 
                        src="https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=1935&auto=format&fit=crop"
                        alt="Shopping background"
                        fill
                        className="object-cover opacity-10"
                        data-ai-hint="shopping background"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-card via-card to-transparent" />
                </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 mt-12 mb-16">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                <FilterSection 
                    categories={categories}
                />
                <div id="recent-products" className="w-full md:w-3/4 lg:w-4/5">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Anuncios Recientes</h2>
                    {isLoading ? (
                      <ProductGridSkeleton />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                          {products.map((product) => (
                              <ProductCard key={product.id} product={product} />
                          ))}
                      </div>
                    )}
                     { !isLoading && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center p-4">
                            <h3 className="text-xl font-semibold">No se encontraron productos</h3>
                            <p className="text-muted-foreground mt-2">Intenta ajustar tus filtros o tu búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
