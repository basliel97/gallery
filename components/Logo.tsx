"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 group cursor-pointer", className)}>
      {/* The Visual Icon (Monogram Y + Camera Aperture) */}
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          {/* Stylized 'Y' integrated with camera frame */}
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          <path d="M9 9l3 3m0 0l3-3m-3 3v6" />
        </svg>
        
        {/* Glow effect behind icon */}
        <div className="absolute inset-0 rounded-xl bg-primary blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* The Text Part */}
      {!iconOnly && (
        <span className="font-heading text-2xl font-bold tracking-tighter text-foreground">
          Yeabsira<span className="text-primary">.</span>
        </span>
      )}
    </div>
  );
}