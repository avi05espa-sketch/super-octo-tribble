"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useUser, useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategories } from "@/lib/data";
import { Loader2 } from "lucide-react";

export default function SellPage() {
  const categories = getCategories();
  const { app } = useFirebase();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const db = getFirestore(app);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState<"Nuevo" | "Usado">();
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "No has iniciado sesión",
        description: "Debes iniciar sesión para publicar un producto.",
      });
      router.push('/auth');
      return;
    }

    if (!title || !description || !price || !category || !condition || !location || !images || images.length === 0) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos requeridos.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For now, we are not handling image uploads, just storing mock URLs.
      // This will be replaced with actual image upload logic later.
      const imageUrls = Array.from(images).map((file, index) => `https://picsum.photos/seed/${user.uid}-${Date.now()}-${index}/600/400`);

      const docRef = await addDoc(collection(db, "products"), {
        title,
        description,
        price: Number(price),
        category,
        condition,
        location,
        sellerId: user.uid,
        images: imageUrls,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "¡Producto publicado!",
        description: "Tu artículo ya está visible para todos.",
      });

      router.push(`/product/${docRef.id}`);

    } catch (error) {
      console.error("Error publishing product:", error);
      toast({
        variant: "destructive",
        title: "Error al publicar",
        description: "Hubo un problema al guardar tu producto. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Button variant="outline" asChild>
            <Link href="/">← Cancelar</Link>
          </Button>
          <h1 className="text-xl font-bold font-headline">Publicar un Producto</h1>
          <div className="w-24"></div>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del producto</CardTitle>
            <CardDescription>
              Completa la información para publicar tu artículo en el marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="photos">Fotos</Label>
                <Input 
                  id="photos" 
                  type="file" 
                  multiple 
                  required 
                  onChange={(e) => setImages(e.target.files)}
                  className="file:text-primary file:font-semibold"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">Sube una o más imágenes de tu producto.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input 
                  id="title" 
                  placeholder="Ej: iPhone 14 en excelentes condiciones" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-zinc-100 dark:bg-zinc-800"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe tu producto detalladamente..." 
                  required 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                   className="bg-zinc-100 dark:bg-zinc-800"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio (MXN)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="2500" 
                    required 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-zinc-100 dark:bg-zinc-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select 
                    required 
                    onValueChange={setCategory}
                    value={category}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="category" className="bg-zinc-100 dark:bg-zinc-800">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
               <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condición</Label>
                  <Select 
                    required 
                    onValueChange={(value: "Nuevo" | "Usado") => setCondition(value)}
                    value={condition}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="condition" className="bg-zinc-100 dark:bg-zinc-800">
                      <SelectValue placeholder="Selecciona la condición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nuevo">Nuevo</SelectItem>
                      <SelectItem value="Usado">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Ubicación general</Label>
                  <Input 
                    id="location" 
                    placeholder="Ej: Playas de Tijuana" 
                    required 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-zinc-100 dark:bg-zinc-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" asChild disabled={isSubmitting}><Link href="/">Cancelar</Link></Button>
                <Button type="submit" disabled={isSubmitting || userLoading}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Publicando..." : "Publicar Anuncio"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
