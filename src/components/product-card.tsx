import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const placeholder = PlaceHolderImages.find(p => p.imageUrl === product.images[0]);
    const imageHint = placeholder?.imageHint || 'product photo';

  return (
    <Link href={`/product/${product.id}`} className="group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-xl shadow-md border-0 rounded-lg">
        <div className="relative w-full aspect-square overflow-hidden">
            <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={imageHint}
            />
            {product.condition === 'Nuevo' && 
              <Badge variant={'accent'} className="absolute top-2 right-2">
                  Nuevo
              </Badge>
            }
        </div>
        <CardContent className="p-3 flex-grow flex flex-col">
          <h3 className="font-semibold text-sm leading-tight truncate group-hover:text-primary">
            {product.title}
          </h3>
          <div className="flex-grow" />
          <p className="font-bold text-lg mt-1">${product.price.toLocaleString('es-MX')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{product.location}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
