
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
        router.push(`/?${params.toString()}`);
    };
    
    const handlePriceChange = (values: number[]) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('maxPrice', values[0].toString());
        router.push(`/?${params.toString()}`);
    }

    const selectedCategories = searchParams.getAll('categories');
    const selectedConditions = searchParams.getAll('conditions');
    const maxPrice = Number(searchParams.get('maxPrice') || '10000');


    return (
      <aside className="w-full md:w-1/4 lg:w-1/5 p-4">
        <h2 className="text-xl font-bold mb-4">Filtros</h2>
        <Accordion type="multiple" defaultValue={['category', 'condition', 'price']} className="w-full">
          <AccordionItem value="category">
            <AccordionTrigger>Categoría</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2">
                {categories.map((cat) => (
                     <div key={cat.id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`cat-${cat.id}`} 
                            checked={selectedCategories.includes(cat.id)}
                            onCheckedChange={() => handleCheckedChange('categories', cat.id)}
                        />
                        <Label htmlFor={`cat-${cat.id}`}>{cat.name}</Label>
                    </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="condition">
            <AccordionTrigger>Condición</AccordionTrigger>
            <AccordionContent>
               <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cond-new" 
                    checked={selectedConditions.includes('Nuevo')}
                    onCheckedChange={() => handleCheckedChange('conditions', 'Nuevo')}
                    />
                  <Label htmlFor="cond-new">Nuevo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cond-used"
                    checked={selectedConditions.includes('Usado')}
                    onCheckedChange={() => handleCheckedChange('conditions', 'Usado')}
                  />
                  <Label htmlFor="cond-used">Usado</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="price">
            <AccordionTrigger>Precio</AccordionTrigger>
            <AccordionContent>
               <div className="space-y-4">
                    <Slider
                        defaultValue={[maxPrice]}
                        max={10000}
                        step={100}
                        onValueCommit={handlePriceChange}
                    />
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>$0</span>
                         <div className="flex items-center gap-2">
                            <span>hasta</span>
                            <Input 
                                type="text"
                                value={`$${maxPrice.toLocaleString()}`}
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
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
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

  const scrollToProducts = () => {
    const productsSection = document.getElementById('recent-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1">
        <section className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white relative">
            <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between py-12 md:py-20">
                <div className="md:w-1/2 mb-8 md:mb-0">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight font-headline">Tijuana Shop</h1>
                    <p className="text-xl mt-2 mb-6">El súper mercado de segunda mano</p>
                    <div className="flex gap-4">
                        <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" onClick={scrollToProducts}>Ver Anuncios</Button>
                        <Link href="/auth?tab=register" passHref>
                          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">Registrarse</Button>
                        </Link>
                    </div>
                </div>
                <div className="md:w-1/2 relative h-64 md:h-auto">
                   <Image 
                        src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Persona comprando"
                        fill
                        className="object-cover rounded-lg"
                        data-ai-hint="woman shopping"
                    />
                </div>
            </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 mt-8">
            <div className="flex flex-col md:flex-row gap-8">
                <FilterSection 
                    categories={categories}
                />
                <div id="recent-products" className="w-full md:w-3/4 lg:w-4/5">
                    <h2 className="text-2xl font-bold tracking-tighter mb-6">Productos Recientes</h2>
                    {isLoading ? (
                      <ProductGridSkeleton />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {products.map((product) => (
                              <ProductCard key={product.id} product={product} />
                          ))}
                      </div>
                    )}
                     { !isLoading && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center">
                            <h3 className="text-xl font-semibold">No se encontraron productos</h3>
                            <p className="text-muted-foreground mt-2">Intenta ajustar tus filtros o tu búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>

      <Link href="/sell" passHref>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
          aria-label="Publicar un Producto"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  );
}

    