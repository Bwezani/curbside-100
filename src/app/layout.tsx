
import type { Metadata } from "next";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";

export const metadata: Metadata = {
  title: "Curbside.",
  description: "Get your groceries delivered fast and free on campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <style>
          {`
            .leaflet-pane {
              z-index: 2 !important;
            }
            .leaflet-control-container {
              z-index: 1001 !important;
            }
          `}
        </style>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen pb-28 md:pb-0">{children}</main>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
