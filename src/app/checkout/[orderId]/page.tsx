
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrder, type Order } from "@/firebase/orders";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, LoaderCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function CheckoutPage() {
  const params = useParams();
  const { orderId } = params;
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const fetchedOrder = await getOrder(orderId as string);
        if (fetchedOrder) {
          if (fetchedOrder.userId !== user.uid) {
            setError("You are not authorized to view this order.");
          } else {
            setOrder(fetchedOrder);
          }
        } else {
          setError("Order not found.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, user, authLoading]);

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "in progress":
        return <LoaderCircle className="h-5 w-5 animate-spin text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  };

  if (loading) {
    return (
       <div className="container mx-auto px-4 py-8">
         <Card className="max-w-2xl mx-auto">
           <CardHeader>
             <Skeleton className="h-8 w-3/4 mb-2" />
             <Skeleton className="h-5 w-1/2" />
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-1/2" />
             </div>
             <Separator className="my-4" />
             <div className="space-y-3">
               <Skeleton className="h-5 w-full" />
               <Skeleton className="h-5 w-full" />
             </div>
             <Separator className="my-4" />
             <Skeleton className="h-8 w-1/3 ml-auto" />
           </CardContent>
           <CardFooter>
             <Skeleton className="h-10 w-full" />
           </CardFooter>
         </Card>
       </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <CardTitle className="mt-4 text-2xl">Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">{error}</p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/shop">Go Back to Shop</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
  }

  if (!order) {
    return null; // Should be covered by error state
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4 text-green-500">
             <CheckCircle className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl text-center">Order Successful!</CardTitle>
          <CardDescription className="text-center text-lg">
            Thank you for your purchase. Your order is now being processed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
             <div className="flex justify-between">
               <span className="text-muted-foreground">Order ID:</span>
               <span className="font-mono">{order.id}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Order Date:</span>
               <span>{formatDate(order.createdAt)}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-muted-foreground">Status:</span>
               <span className="flex items-center gap-2 capitalize font-medium">
                  {renderStatusIcon(order.status)}
                  {order.status}
               </span>
             </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
             <h3 className="font-semibold">Items</h3>
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>K{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <div className="grid gap-1 text-right">
              <div className="text-lg">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-bold">K{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <p className="text-xs text-muted-foreground text-center">You will be contacted by our delivery team shortly. Keep your phone nearby.</p>
            <Button asChild className="w-full mt-2">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

