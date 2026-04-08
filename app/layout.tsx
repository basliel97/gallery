"use client";

import { Sora, Space_Grotesk } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header"; // Import updated Header
import BottomNav from "@/components/BottomNav";
import { PublicFooter } from "@/components/PublicFooter";
import { cn } from "@/lib/utils";

const sora = Sora({ subsets: ["latin"], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: '--font-heading' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const publicPaths = ["/", "/about", "/contact"];
  const authPaths = ["/login", "/signup"];
  const isPublic = publicPaths.includes(pathname);
  const isAuth = authPaths.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          
          {/* Header is now visible everywhere EXCEPT login/signup */}
          {!isAuth && <Header />}

          <main className={cn(
            "mx-auto flex min-h-screen w-full flex-col px-4",
            !isAuth ? "pt-20" : "pt-0", // Space for the sticky header
            isPublic ? "max-w-7xl pb-12" : "max-w-2xl pb-32",
            isAuth && "items-center justify-center"
          )}>
            {children}
          </main>

          {/* Footer only on Landing/About/Contact */}
          {isPublic && <PublicFooter />}

          {/* Bottom Nav on Internal pages */}
          {!isPublic && !isAuth && <BottomNav />}

          <Toaster richColors position="top-center" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}