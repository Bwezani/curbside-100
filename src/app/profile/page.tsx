"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { User, LogIn, Home, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserProfile, type UserProfile } from "@/firebase/user";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setLoadingProfile(true);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        setLoadingProfile(false);
      }
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  const getInitials = (name?: string | null) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase();
  };

  const isLoading = authLoading || loadingProfile;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader className="items-center text-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-full" />
               </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-full" />
               </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-full" />
               </div>
            </CardContent>
            <CardFooter className="flex justify-center">
               <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <LogIn className="h-16 w-16 mb-4 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Access Denied
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            You need to be signed in to view this page.
          </p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.photoURL || ""} alt={userProfile?.username || "User"} />
              <AvatarFallback className="text-3xl">
                {getInitials(userProfile?.username) || <User className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{userProfile?.username || "User Profile"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{userProfile?.phoneNumber}</span>
            </div>
             <div className="flex items-center gap-4">
              <Home className="h-5 w-5 text-muted-foreground" />
              <span>{userProfile?.hostel} Hostel</span>
            </div>
             <div className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>Block {userProfile?.block}, Room {userProfile?.room}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={signOut} variant="destructive">
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
