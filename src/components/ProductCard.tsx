import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className="flex flex-col overflow-hidden h-full transition-shadow duration-300 hover:shadow-xl cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="aspect-square relative">
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            className="object-cover"
            data-ai-hint={product.dataAiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-1">{product.name}</CardTitle>
        <CardDescription>{product.shortDescription}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-2xl font-bold text-primary">
          K{product.price.toFixed(2)}
        </p>
        <Button>View</Button>
      </CardFooter>
    </Card>
  );
}
