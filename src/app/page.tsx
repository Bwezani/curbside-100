import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center p-4">
      <div className="flex items-center justify-center mb-6">
        <Leaf className="w-16 h-16 text-primary" />
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter ml-4">
          Curbside.
        </h1>
      </div>
      <p className="max-w-xl text-lg md:text-xl text-foreground/80 mb-8">
        Get your groceries delivered fast and free on campus. Fresh produce,
        pantry staples, and your favorite snacks, right to your door.
      </p>
      <Button asChild size="lg" className="text-lg">
        <Link href="/shop">Shop Now</Link>
      </Button>
    </div>
  );
}
