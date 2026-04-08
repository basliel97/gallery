"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Camera, Menu, X, LogOut, Home, Images, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "./ConfirmDialog";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
const triggerLogout = () => setIsLogoutConfirmOpen(true);
  // Check auth state
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/gallery", label: "Gallery", icon: Images },
    { href: "/about", label: "About", icon: User },
    { href: "/contact", label: "Contact", icon: Camera },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
  <Logo />
</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="h-4 w-px bg-white/10" />

          {user ? (
            <Button variant="ghost" size="sm" onClick={() => setIsLogoutConfirmOpen(true)} className="text-muted-foreground hover:text-destructive">
              <LogOut className="size-4 mr-2" /> Logout
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" className="rounded-full" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Collapsible Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 border-b border-white/5 overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <link.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-white/5">
                {user ? (
                  <Button variant="destructive" className="w-full justify-start" onClick={() => setIsLogoutConfirmOpen(true)}>
                    <LogOut className="size-4 mr-3" /> Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full" asChild onClick={() => setIsOpen(false)}>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="w-full" asChild onClick={() => setIsOpen(false)}>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="End Session?"
        description="Are you sure you want to sign out of Yeabsira's Gallery?"
        confirmText="Logout"
        variant="destructive"
      />
    </header>
  );
}