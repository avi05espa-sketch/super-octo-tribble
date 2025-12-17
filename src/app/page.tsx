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
import { useSearchParams } from "next/navigation";

const iconMap: { [key: string]: React.ElementType } = {
  Autos: Car,
  Electrónica: Smartphone,
  Hogar: HomeIcon,
  Ropa: Shirt,
  Otros: Blocks,
};

const FilterSection = ({ 
    categories,
    selectedCategories,
    onCategoryChange,
    selectedConditions,
    onConditionChange
}: { 
    categories: Category[],
    selectedCategories: string[],
    onCategoryChange: (id: string, checked: boolean) => void,
    selectedConditions: string[],
    onConditionChange: (condition: string, checked: boolean) => void
}) => (
  <aside className="w-full md:w-1/4 lg:w-1/5 p-4">
    <h2 className="text-xl font-bold mb-4">Filtros</h2>
    <Accordion type="multiple" defaultValue={['category', 'condition']} className="w-full">
      <AccordionItem value="category">
        <AccordionTrigger>Categoría</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-2">
            {categories.map((cat) => (
                 <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox 
                        id={`cat-${cat.id}`} 
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={(checked) => onCategoryChange(cat.id, checked as boolean)}
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
                onCheckedChange={(checked) => onConditionChange('Nuevo', checked as boolean)}
                />
              <Label htmlFor="cond-new">Nuevo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cond-used"
                checked={selectedConditions.includes('Usado')}
                onCheckedChange={(checked) => onConditionChange('Usado', checked as boolean)}
              />
              <Label htmlFor="cond-used">Usado</Label>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
       <AccordionItem value="price">
        <AccordionTrigger>Precio</AccordionTrigger>
        <AccordionContent>
          <p>Controles de precio aquí.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </aside>
);


export default function Home() {
  const { firestore } = useFirebase();
  const searchParams = useSearchParams();
  const categories = useMemo(() => getCategories(), []);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const searchTerm = searchParams.get('search') || undefined;

      const fetchedProducts = await getProducts(firestore, { 
          categories: selectedCategories, 
          conditions: selectedConditions,
          searchTerm: searchTerm,
      });
      setProducts(fetchedProducts);
      setIsLoading(false);
    };

    fetchProducts();
  }, [firestore, selectedCategories, selectedConditions, searchParams]);

  const handleCategoryChange = (id: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked ? [...prev, id] : prev.filter(catId => catId !== id)
    );
  };
    
  const handleConditionChange = (condition: string, checked: boolean) => {
    setSelectedConditions(prev => 
      checked ? [...prev, condition] : prev.filter(c => c !== condition)
    );
  };
  
  const scrollToProducts = () => {
    const productsSection = document.getElementById('recent-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white relative">
            <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between py-12 md:py-20">
                <div className="md:w-1/2 mb-8 md:mb-0">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">Tijuana Shop</h1>
                    <p className="text-xl mt-2 mb-6">El súper mercado de segunda mano</p>
                    <div className="flex gap-4">
                        <Button size="lg" className="bg-red-500 hover:bg-red-600" onClick={scrollToProducts}>Ver Anuncios</Button>
                        <Link href="/auth?tab=register" passHref>
                          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-teal-500">Registrarse</Button>
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
                    selectedCategories={selectedCategories}
                    onCategoryChange={handleCategoryChange}
                    selectedConditions={selectedConditions}
                    onConditionChange={handleConditionChange}
                />
                <div id="recent-products" className="w-full md:w-3/4 lg:w-4/5">
                    <h2 className="text-2xl font-bold tracking-tighter mb-6">Productos Recientes</h2>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {products.map((product) => (
                              <ProductCard key={product.id} product={product} />
                          ))}
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
