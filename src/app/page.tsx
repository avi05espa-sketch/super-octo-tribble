import Link from "next/link";
import {
  Car,
  Smartphone,
  Home as HomeIcon,
  Shirt,
  Blocks,
  Plus,
  ChevronDown,
} from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { Header } from "@/components/header";
import { getProducts, getCategories } from "@/lib/data";
import type { Category } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const iconMap: { [key: string]: React.ElementType } = {
  Autos: Car,
  Electrónica: Smartphone,
  Hogar: HomeIcon,
  Ropa: Shirt,
  Otros: Blocks,
};

const FilterSection = () => (
  <aside className="w-full md:w-1/4 lg:w-1/5 p-4">
    <h2 className="text-xl font-bold mb-4">Filtros</h2>
    <Accordion type="multiple" defaultValue={['category', 'condition']} className="w-full">
      <AccordionItem value="category">
        <AccordionTrigger>Categoría</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-autos" />
              <Label htmlFor="cat-autos">Autos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-electronica" />
              <Label htmlFor="cat-electronica">Electrónica</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-hogar" />
              <Label htmlFor="cat-hogar">Hogar</Label>
            </div>
             <div className="flex items-center space-x-2">
              <Checkbox id="cat-ropa" />
              <Label htmlFor="cat-ropa">Ropa</Label>
            </div>
             <div className="flex items-center space-x-2">
              <Checkbox id="cat-otros" />
              <Label htmlFor="cat-otros">Otros</Label>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="condition">
        <AccordionTrigger>Condición</AccordionTrigger>
        <AccordionContent>
           <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="cond-new" />
              <Label htmlFor="cond-new">Nuevo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cond-used" />
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
  const products = getProducts();
  const categories = getCategories();

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
                        <Button size="lg" className="bg-red-500 hover:bg-red-600">Ver Anuncios</Button>
                        <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-teal-500">Registrarse</Button>
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
                <FilterSection />
                <div className="w-full md:w-3/4 lg:w-4/5">
                    <h2 className="text-2xl font-bold tracking-tighter mb-6">Productos Recientes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
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
