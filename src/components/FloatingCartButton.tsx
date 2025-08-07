
"use-client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

export function FloatingCartButton() {
  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40">
      <Button asChild size="lg" className="rounded-full h-14 w-14 p-0 shadow-lg">
        <Link href="/my-orders">
          <ClipboardList className="h-6 w-6" />
          <span className="sr-only">My Orders</span>
        </Link>
      </Button>
    </div>
  );
}
