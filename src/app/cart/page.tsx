
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, Plus, Minus, LoaderCircle, Calendar as CalendarIcon, Clock } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { createOrder } from "@/firebase/orders";
import { getUserProfile } from "@/firebase/user";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

const deliveryTimeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
];


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);

  // Delivery options state
  const [deliveryOption, setDeliveryOption] = useState<'now' | 'later'>('now');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
  const [deliveryTime, setDeliveryTime] = useState<string | undefined>(undefined);


  const handleProceedToCheckout = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setShowDeliveryDialog(true);
  };
  
  const handleConfirmOrder = async () => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be signed in.", variant: "destructive"});
        return;
    }
    if (deliveryOption === 'later' && (!deliveryDate || !deliveryTime)) {
        toast({ title: "Missing Information", description: "Please select a delivery date and time.", variant: "destructive"});
        return;
    }

    setIsCheckingOut(true);
    setShowDeliveryDialog(false);
    
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
        deliveryOption: deliveryOption,
        deliveryTime: deliveryOption === 'later' ? `${format(deliveryDate!, 'PPP')} at ${deliveryTime}` : 'Deliver Now',
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
  
  const AuthCheckDialog = () => (
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                  <AlertDialogDescription>
                      You need to sign in or create an account to continue with your purchase.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:flex-row-reverse gap-2">
                  <AlertDialogAction asChild>
                      <Link href="/auth/signin" className="w-full sm:w-auto">Sign In</Link>
                  </AlertDialogAction>
                  <AlertDialogAction asChild variant="secondary">
                       <Link href="/auth/signup" className="w-full sm:w-auto">Sign Up</Link>
                  </AlertDialogAction>
                   <AlertDialogCancel className="mt-0 w-full sm:w-auto">Cancel</AlertDialogCancel>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
  );

  const DeliveryOptionsDialog = () => (
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Choose Delivery Time</DialogTitle>
                  <DialogDescription>When would you like to receive your order?</DialogDescription>
              </DialogHeader>
              <RadioGroup value={deliveryOption} onValueChange={(val: 'now' | 'later') => setDeliveryOption(val)} className="my-4 space-y-4">
                  <div>
                      <RadioGroupItem value="now" id="now" className="peer sr-only" />
                      <Label htmlFor="now" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                          Deliver Now
                          <span className="text-xs text-muted-foreground mt-1">Estimated delivery: 30-60 minutes</span>
                      </Label>
                  </div>
                   <div>
                      <RadioGroupItem value="later" id="later" className="peer sr-only" />
                      <Label htmlFor="later" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                          Schedule for Later
                          <span className="text-xs text-muted-foreground mt-1">Select a date and time</span>
                      </Label>
                  </div>
              </RadioGroup>

              {deliveryOption === 'later' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in-0 duration-300">
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button variant={"outline"} className={cn("justify-start text-left font-normal", !deliveryDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={deliveryDate}
                                onSelect={setDeliveryDate}
                                disabled={(date) => date < addDays(new Date(), -1) || date > addDays(new Date(), 30)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                     <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                         <SelectTrigger>
                             <SelectValue placeholder={
                                <div className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span>Select a time</span>
                                </div>
                             } />
                         </SelectTrigger>
                         <SelectContent>
                             {deliveryTimeSlots.map(slot => (
                                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                  </div>
              )}

              <DialogFooter>
                  <Button onClick={handleConfirmOrder} disabled={isCheckingOut}>
                      {isCheckingOut ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>
                            Placing Order...
                          </>
                      ) : "Confirm Order"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
  );

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
        <FloatingCartButton />
      </div>
    );
  }

  // Create a unique key for each cart item
  const getCartItemKey = (item: { id: string; variationName: string }) => `${item.id}-${item.variationName}`;

  return (
    <div className="container mx-auto px-4 py-8">
       <AuthCheckDialog />
       <DeliveryOptionsDialog />
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
          <Button size="lg" className="text-lg" onClick={handleProceedToCheckout} disabled={isCheckingOut || cart.length === 0}>
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
       <FloatingCartButton />
    </div>
  );
}
