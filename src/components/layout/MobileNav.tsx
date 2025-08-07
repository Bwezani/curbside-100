
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBasket,
  ShoppingCart,
  User,
  LogIn,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "../ui/badge";

export function MobileNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { cart } = useCart();
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const baseNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/shop", icon: ShoppingBasket, label: "Shop" },
  ];
  
  if (user?.displayName === "Bwezani Juma") {
    baseNavItems.push({ href: "/admin", icon: Shield, label: "Admin" });
  }

  baseNavItems.push({ href: "/cart", icon: ShoppingCart, label: "Cart", badge: cartItemCount });
  
  const authItem = !loading && user
    ? { href: "/profile", icon: User, label: "Profile" }
    : { href: "/auth/signin", icon: LogIn, label: "Sign In" };
  
  const navItems = [...baseNavItems, authItem];


  // Hide nav on my-orders page
  if (pathname === '/my-orders') {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 rounded-2xl border bg-background/80 backdrop-blur-lg shadow-lg z-50">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors rounded-2xl relative",
                isActive ? "text-primary" : "text-foreground/60 hover:text-primary"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                 <Badge className="absolute top-0 right-4 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
                    {item.badge}
                 </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
