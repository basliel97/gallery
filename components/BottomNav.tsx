"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, Settings, Upload, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/albums", label: "Albums", icon: FolderOpen },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-background/60 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-white/20 bg-white/10 px-2 py-1 shadow-lg backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition-all",
                active
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}