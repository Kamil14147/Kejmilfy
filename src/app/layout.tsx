import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kejmilfy — edytor graficzny online",
  description: "Pełnowartościowy edytor graficzny online typu Canva. Szablony, tekst, kształty, obrazy, eksport, współpraca i więcej.",
  keywords: ["edytor graficzny", "Canva", "design", "posty social media", "prezentacje"],
  authors: [{ name: "kejmilfy" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>
            {children}
            <Toaster />
            <ServiceWorkerRegister />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
