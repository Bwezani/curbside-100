
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus } from "lucide-react";

interface ProductModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Reset variation and quantity when modal opens
  useEffect(() => {
    if (open) {
      setSelectedVariationIndex(0);
      setQuantity(1);
    }
  }, [open]);

  const currentVariation = product.variations[selectedVariationIndex];
  const finalPrice = useMemo(() => {
    return product.price + (currentVariation?.priceModifier || 0);
  }, [product.price, currentVariation]);

  const handleVariationChange = (value: string) => {
    setSelectedVariationIndex(parseInt(value, 10));
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: finalPrice, // Use the final price with variation modifier
      variationName: currentVariation.name,
    }, quantity);
    toast({
      title: "Added to Cart!",
      description: `${quantity} x ${product.name} (${currentVariation.name}) has been added to your cart.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] grid-rows-[auto_1fr_auto] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              className="object-cover"
              data-ai-hint={product.dataAiHint}
            />
          </div>
          <DialogTitle className="text-3xl font-bold">{product.name}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {product.fullDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 grid gap-4">
          {product.variations.length > 1 && (
            <div>
              <label htmlFor="variation-select" className="text-sm font-medium">Size / Variation</label>
              <Select onValueChange={handleVariationChange} defaultValue="0">
                <SelectTrigger id="variation-select" className="w-full mt-1">
                  <SelectValue placeholder="Select a variation" />
                </SelectTrigger>
                <SelectContent>
                  {product.variations.map((variation, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {variation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
           <div>
              <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
               <div className="flex items-center border rounded-md mt-1">
                 <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                   <Minus className="h-4 w-4" />
                 </Button>
                 <Input
                   id="quantity"
                   type="number"
                   className="h-10 w-16 text-center border-0 bg-transparent focus-visible:ring-0"
                   value={quantity}
                   onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                   min="1"
                 />
                 <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}>
                   <Plus className="h-4 w-4" />
                 </Button>
               </div>
           </div>
        </div>
        <DialogFooter className="p-6 pt-0 bg-secondary/50 flex-row justify-between items-center rounded-b-lg">
          <p className="text-3xl font-bold text-primary">K{(finalPrice * quantity).toFixed(2)}</p>
          <Button size="lg" className="text-lg" onClick={handleAddToCart}>Add to Cart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
