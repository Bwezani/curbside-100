
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createUserProfile } from "@/firebase/user";
import { LoaderCircle } from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  phoneNumber: z.string().min(10, "Please enter a valid phone number."),
  hostel: z.string().min(1, "Hostel or boarding location is required."),
  block: z.string().optional(),
  room: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CompleteProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.displayName || "",
      phoneNumber: "",
      hostel: "",
      block: "",
      room: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      // If auth is done loading and there's no user,
      // redirect them to the sign-in page.
      router.replace("/auth/signin");
    }
     if (user?.displayName && !form.getValues("username")) {
        form.setValue("username", user.displayName);
    }
  }, [user, authLoading, router, form]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    try {
        await createUserProfile(user.uid, {
          email: user.email!, // Email is guaranteed to exist for a logged-in user
          username: data.username,
          phoneNumber: data.phoneNumber,
          hostel: data.hostel,
          block: data.block || '',
          room: data.room || '',
        });

        toast({
            title: "Profile Complete!",
            description: "Welcome! Your profile has been successfully created.",
        });

        router.push("/shop");

    } catch(error: any) {
        toast({
            title: "Update Failed",
            description: error.message || "Could not update your profile. Please try again.",
            variant: "destructive",
        })
    } finally {
        setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Just a few more details and you'll be all set. Your email is {user.email}.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., john.doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., 09xxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hostel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostel / Boarding Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kwacha / 15 Miles" {...field} />
                    </FormControl>
                    <FormDescription>If not in a campus hostel, enter your boarding area.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="block"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Block</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A (Optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 101 (Optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                ) : "Save and Continue"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
