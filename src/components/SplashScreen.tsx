
"use client";

import { Leaf } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="flex items-center gap-4 animate-pulse">
        <Leaf className="h-16 w-16 text-primary" />
        <span className="text-5xl font-bold tracking-tight">Curbside.</span>
      </div>
    </div>
  );
}
