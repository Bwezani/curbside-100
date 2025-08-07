
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, PackagePlus, ClipboardList, CheckCircle, LoaderCircle, Trash2, PlusCircle, AlertTriangle } from 'lucide-react';
import { getAllUsers, type UserProfile } from "@/firebase/user";
import { addProduct } from "@/firebase/products";
import type { Product } from "@/lib/types";
import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { getAllOrders, type Order, completeOrder } from "@/firebase/orders";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";


const productSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  image: z.string().url("Please enter a valid URL."),
  imageAlt: z.string().min(1, "Image alt text is required."),
  shortDescription: z.string().min(1, "Short description is required."),
  fullDescription: z.string().min(1, "Full description is required."),
  price: z.coerce.number().positive("Price must be a positive number."),
  category: z.string().min(1, "Category is required."),
  dataAiHint: z.string().min(1, "AI hint is required."),
  variations: z.array(z.object({
    name: z.string().min(1, "Variation name is required."),
    priceModifier: z.coerce.number(),
  })).min(1, "At least one variation is required."),
});

type ProductFormValues = z.infer<typeof productSchema>;

// --- Main Component ---

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const { toast } = useToast();
  
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      image: "",
      imageAlt: "",
      shortDescription: "",
      fullDescription: "",
      price: 0,
      category: "",
      dataAiHint: "",
      variations: [{ name: "", priceModifier: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: productForm.control,
    name: "variations",
  });

  useEffect(() => {
    // Only fetch data if the user is the admin
    if (user?.displayName === "Bwezani Juma") {
      const fetchUsers = async () => {
        try {
          setUsersLoading(true);
          const fetchedUsers = await getAllUsers();
          setUsers(fetchedUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
          setUsersError("Failed to load users. Please try again later.");
        } finally {
          setUsersLoading(false);
        }
      };
      
      const fetchOrders = async () => {
        try {
          setOrdersLoading(true);
          const fetchedOrders = await getAllOrders();
          setOrders(fetchedOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
          setOrdersError("Failed to load orders. Please try again later.");
        } finally {
          setOrdersLoading(false);
        }
      };

      fetchUsers();
      fetchOrders();
    }
  }, [user]);
  
  const handleAddProduct = async (data: ProductFormValues) => {
    try {
      const newProductId = String(Math.floor(100 + Math.random() * 900));
      const newProduct: Product = {
        ...data,
        id: newProductId,
      };

      await addProduct(newProduct);

      toast({
        title: "Product Added!",
        description: `${data.name} has been successfully added.`,
      });
      productForm.reset();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsDone = async (orderToComplete: Order) => {
    try {
      await completeOrder(orderToComplete);
      setOrders(orders.filter(order => order.id !== orderToComplete.id));
      toast({
          title: "Order Completed",
          description: `Order ${orderToComplete.id} has been moved to completed orders.`
      })
    } catch (error) {
        console.error("Error completing order:", error);
        toast({
            title: "Error",
            description: "Failed to mark order as done. Please try again.",
            variant: "destructive",
        });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMM d, yyyy");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.displayName !== "Bwezani Juma") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <CardTitle className="mt-4 text-2xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
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


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
          <TabsTrigger value="users" className="py-2">
            <User className="mr-2" /> Users
          </TabsTrigger>
          <TabsTrigger value="add-product" className="py-2">
            <PackagePlus className="mr-2" /> Add Product
          </TabsTrigger>
          <TabsTrigger value="orders" className="py-2">
            <ClipboardList className="mr-2" /> Orders
          </TabsTrigger>
        </TabsList>

        {/* Users Section */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>A list of all users who have registered on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                 <div className="flex justify-center items-center py-20">
                    <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                 </div>
              ) : usersError ? (
                  <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{usersError}</AlertDescription>
                  </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Registered On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>{`${user.hostel}, Block ${user.block}, Room ${user.room}`}</TableCell>
                        <TableCell className="text-right">{formatDate(user.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Product Section */}
        <TabsContent value="add-product">
          <Card>
            <CardHeader>
              <CardTitle>Add a New Product</CardTitle>
              <CardDescription>Fill out the form below to add a new item to the shop.</CardDescription>
            </CardHeader>
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(handleAddProduct)}>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={productForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Mealie Meal" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={productForm.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (K)</FormLabel>
                        <FormControl><Input type="number" step="0.01" placeholder="e.g., 180.00" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                  
                  <FormField control={productForm.control} name="image" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl><Input placeholder="https://placehold.co/400x400.png" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={productForm.control} name="imageAlt" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image Alt Text</FormLabel>
                        <FormControl><Input placeholder="A bag of Zambian mealie meal" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={productForm.control} name="dataAiHint" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image AI Hint</FormLabel>
                        <FormControl><Input placeholder="mealie meal bag" {...field} /></FormControl>
                         <FormDescription>One or two keywords for AI image search.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}/>
                  </div>

                  <FormField control={productForm.control} name="shortDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl><Textarea placeholder="A short, catchy description for the product card." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>

                  <FormField control={productForm.control} name="fullDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl><Textarea placeholder="A detailed description for the product view." {...field} rows={4} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  
                   <FormField control={productForm.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl><Input placeholder="e.g., Staples, Vegetables" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>

                  <div>
                     <Label className="text-base font-medium">Variations</Label>
                     <div className="space-y-4 mt-2">
                        {fields.map((field, index) => (
                           <div key={field.id} className="flex items-start gap-4 p-4 border rounded-lg">
                              <div className="grid grid-cols-2 gap-4 flex-grow">
                                <FormField control={productForm.control} name={`variations.${index}.name`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Variation Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., 25kg Bag" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={productForm.control} name={`variations.${index}.priceModifier`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price Modifier</FormLabel>
                                        <FormControl><Input type="number" step="0.01" placeholder="e.g., -100.00 or 50.00" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                              </div>
                               <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="mt-8 flex-shrink-0"
                                onClick={() => remove(index)}
                                disabled={fields.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        ))}
                     </div>
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => append({ name: "", priceModifier: 0 })}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Variation
                      </Button>
                  </div>
                  

                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={productForm.formState.isSubmitting}>
                    {productForm.formState.isSubmitting ? (
                        <>
                         <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Adding...
                        </>
                    ) : "Add Product"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        {/* Orders Section */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Placed Orders</CardTitle>
              <CardDescription>Manage and track all customer orders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ordersLoading ? (
                <div className="flex justify-center items-center py-20">
                  <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : ordersError ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{ordersError}</AlertDescription>
                </Alert>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4">
                    <div className="flex-grow mb-4 md:mb-0">
                      <div className="flex items-center gap-4">
                        <h3 className="font-bold text-lg">{order.id}</h3>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="capitalize">{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">User: {order.username}</p>
                      <p className="text-sm text-muted-foreground">Phone: {order.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">Hostel: {order.hostel}</p>
                      <p className="text-sm text-muted-foreground">Placed on: {formatDate(order.createdAt)}</p>
                      <ul className="list-disc pl-5 mt-2 text-sm">
                        {order.items.map((item, index) => (
                          <li key={index}>{item.name} (x{item.quantity})</li>
                        ))}
                      </ul>
                    </div>
                    {order.status === "in progress" && (
                      <Button onClick={() => handleMarkAsDone(order)}>
                        <CheckCircle className="mr-2" /> Mark as Done
                      </Button>
                    )}
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
