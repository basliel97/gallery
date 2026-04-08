"use client";

import { Camera, CircleFadingPlus, Heart, Mail } from "lucide-react";
import Link from "next/link";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-background/60 py-12 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:rotate-6">
                <Camera className="h-4 w-4" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight">Yeabsira</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              A private, elegant space designed to preserve and celebrate your most meaningful moments in high definition.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider">Explore</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About the Gallery</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Get in Touch</Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sign In</Link>
            </nav>
          </div>

          {/* Social/Contact */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider">Connect</h3>
            <div className="flex gap-4">
              
              <a href="https://www.instagram.com/yeabsira.yohannes/" className="p-2 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                <CircleFadingPlus className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} Yeabsira's Gallery. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made for Yeabsira
          </p>
        </div>
      </div>
    </footer>
  );
}