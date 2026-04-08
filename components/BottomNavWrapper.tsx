"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

const hiddenNavPaths = ["/login", "/signup", "/", "/about", "/contact"];

export default function BottomNavWrapper() {
  const pathname = usePathname();
  
  if (hiddenNavPaths.includes(pathname)) return null;
  
  return <BottomNav />;
}