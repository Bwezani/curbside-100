
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, Plus, Minus, LoaderCircle } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { createOrder } from "@/firebase/orders";
import { getUserProfile } from "@/firebase/user";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to proceed to checkout.",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }

    setIsCheckingOut(true);
    try {
      const userProfile = await getUserProfile(user.uid);

      if (!userProfile) {
        throw new Error("User profile not found. Please complete your profile.");
      }

      const orderData = {
        totalPrice: getCartTotal(),
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        username: userProfile.username,
        phoneNumber: userProfile.phoneNumber,
        hostel: userProfile.hostel,
      };
      
      const orderId = await createOrder(user.uid, orderData);
      
      clearCart();
      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
      });
      router.push(`/checkout/${orderId}`);

    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an issue placing your order.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0 && !isCheckingOut) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <ShoppingCart className="h-16 w-16 mb-4 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight mb-2">Your Cart is Empty</h1>
          <p className="text-lg text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Create a unique key for each cart item
  const getCartItemKey = (item: { id: string; variationName: string }) => `${item.id}-${item.variationName}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Your Cart</h1>
        <Button variant="outline" onClick={clearCart} disabled={isCheckingOut}>Clear Cart</Button>
      </div>

      <Card className="mb-8 p-6">
        <h2 className="text-2xl font-semibold">
          Cart Total: <span className="text-primary">K{getCartTotal().toFixed(2)}</span>
        </h2>
      </Card>

      <div className="space-y-6">
        {cart.map((item) => (
          <Card key={getCartItemKey(item)} className="overflow-hidden">
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-full md:w-32 h-32 md:h-auto aspect-square relative rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.variationName}</p>
                <p className="text-lg font-bold text-primary mt-1">
                  K{item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-4 pt-2 md:pt-0">
                 <div className="flex items-center border rounded-md">
                   <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => updateQuantity(getCartItemKey(item), item.quantity - 1)} disabled={item.quantity <= 1 || isCheckingOut}>
                     <Minus className="h-4 w-4" />
                   </Button>
                   <Input
                     type="number"
                     className="h-10 w-16 text-center border-0 bg-transparent focus-visible:ring-0"
                     value={item.quantity}
                     onChange={(e) => updateQuantity(getCartItemKey(item), parseInt(e.target.value) || 1)}
                     min="1"
                     disabled={isCheckingOut}
                   />
                   <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => updateQuantity(getCartItemKey(item), item.quantity + 1)} disabled={isCheckingOut}>
                     <Plus className="h-4 w-4" />
                   </Button>
                 </div>
                 <Button variant="destructive" size="icon" onClick={() => removeFromCart(getCartItemKey(item))} disabled={isCheckingOut}>
                   <Trash2 className="h-5 w-5" />
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="mt-8 flex justify-end">
          <Button size="lg" className="text-lg" onClick={handleCheckout} disabled={isCheckingOut || cart.length === 0}>
            {isCheckingOut ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Checkout"
            )}
            </Button>
       </div>
    </div>
  );
}
