
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SplashScreen } from "@/components/SplashScreen";
import { ShoppingBasket, UtensilsCrossed, ArrowRight } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGroceriesClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/shop");
    }, 2000); // 2-second delay for the splash screen
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-background overflow-hidden">
      {/* Groceries Section */}
      <div 
        onClick={handleGroceriesClick}
        className="group w-full md:w-1/2 h-full flex flex-col justify-center items-center p-8 bg-cover bg-center text-white relative transition-all duration-300 ease-in-out md:hover:w-3/5 cursor-pointer" 
        style={{backgroundImage: "url('https://i.postimg.cc/k4BRAy01/vegetables-bg.jpg')"}}
      >
         <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors duration-300"></div>
         <div className="relative z-10 flex flex-col items-center text-center">
             <ShoppingBasket className="h-20 w-20 mb-4 text-primary transition-transform duration-300 group-hover:scale-110" />
             <h2 className="text-5xl font-bold tracking-tighter">
             Curbside. <span className="font-light">Groceries</span>
             </h2>
             <p className="max-w-sm mt-4 text-lg text-white/80">
                Fresh produce, pantry staples, and all your essentials, delivered fast.
             </p>
             <div className="mt-8 flex items-center gap-2 text-primary font-semibold text-lg transition-transform duration-300 group-hover:translate-x-2">
                <span>Shop Now</span>
                <ArrowRight className="h-5 w-5" />
             </div>
         </div>
      </div>

      {/* Eats Section */}
       <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className="group w-full md:w-1/2 h-full flex flex-col justify-center items-center p-8 bg-secondary/80 text-foreground relative cursor-pointer transition-all duration-300 ease-in-out md:hover:w-3/5">
             <div className="relative z-10 flex flex-col items-center text-center">
                <UtensilsCrossed className="h-20 w-20 mb-4 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-110" />
                <h2 className="text-5xl font-bold tracking-tighter">
                   Curbside. <span className="font-light">Eats</span>
                </h2>
                <p className="max-w-sm mt-4 text-lg text-muted-foreground">
                    Your favorite local restaurants, delivered right to your doorstep.
                </p>
                 <div className="mt-8 flex items-center gap-2 text-muted-foreground font-semibold text-lg transition-transform duration-300 group-hover:translate-x-2 group-hover:text-primary">
                    <span>Explore</span>
                    <ArrowRight className="h-5 w-5" />
                </div>
             </div>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Coming Soon!</AlertDialogTitle>
            <AlertDialogDescription>
              Curbside. Eats is still in the kitchen! We're working hard to bring you the best local food delivery service. Stay tuned!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
