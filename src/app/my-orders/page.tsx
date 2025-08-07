
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getAllPendingOrders, getAllCompletedOrders, type Order } from '@/firebase/orders';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoaderCircle, AlertTriangle, ClipboardList, CheckCircle, PackageSearch, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [allPendingOrders, setAllPendingOrders] = useState<Order[]>([]);
  const [allCompletedOrders, setAllCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pending, completed] = await Promise.all([
          getAllPendingOrders(),
          getAllCompletedOrders(),
        ]);
        setAllPendingOrders(pending);
        setAllCompletedOrders(completed);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading]);

  const userPendingOrders = useMemo(() => {
    if (!user) return [];
    return allPendingOrders.filter(order => order.userId === user.uid);
  }, [allPendingOrders, user]);

  const userCompletedOrders = useMemo(() => {
    if (!user) return [];
    return allCompletedOrders.filter(order => order.userId === user.uid);
  }, [allCompletedOrders, user]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const renderOrderList = (orders: Order[], emptyMessage: string) => {
    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <PackageSearch className="h-16 w-16 mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Order #{order.id.substring(0, 7)}...</span>
                <span className="text-base font-medium text-primary">K{order.totalPrice.toFixed(2)}</span>
              </CardTitle>
              <CardDescription>
                Placed on {formatDate(order.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                    </span>
                    <span>K{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
    if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
         <Card className="max-w-md mx-auto">
            <CardHeader>
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <CardTitle className="mt-4 text-2xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You must be signed in to view your orders.</p>
            </CardContent>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/auth/signin">Sign In</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">My Orders</h1>
         <Button asChild variant="outline">
              <Link href="/shop">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Shop
              </Link>
          </Button>
      </div>

      {error ? (
        <Card className="max-w-md mx-auto bg-destructive/10 border-destructive">
             <CardHeader>
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <CardTitle className="mt-4 text-2xl text-center text-destructive">Error</CardTitle>
            </CardHeader>
             <CardContent>
                <p className="text-center text-destructive/90">{error}</p>
            </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-auto">
            <TabsTrigger value="pending" className="py-2">
              <ClipboardList className="mr-2 h-5 w-5" /> Pending Orders
            </TabsTrigger>
            <TabsTrigger value="completed" className="py-2">
              <CheckCircle className="mr-2 h-5 w-5" /> Completed Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            {renderOrderList(userPendingOrders, 'You have no pending orders.')}
          </TabsContent>
          <TabsContent value="completed">
            {renderOrderList(userCompletedOrders, 'You have no completed orders yet.')}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
