"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, ArrowRight, Sparkles } from "lucide-react";

export function LandingHero({ user }: { user: any }) {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center pt-10 text-center">
      
      {/* --- EXTRA LARGE VIDEO PROFILE CIRCLE --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
        className="relative mb-12"
      >
        {/* Breathing Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse scale-110" />
        <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary/40 via-rose-400/40 to-orange-300/40 blur-xl opacity-50" />
        
        {/* The Circle Container (Bigger size: 192px on mobile, 256px on desktop) */}
        <div className="relative size-48 md:size-64 rounded-full border-[6px] border-background overflow-hidden bg-zinc-900 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-10">
  <video 
  autoPlay 
  loop 
  muted 
  playsInline 
  className="h-full w-full object-cover"
>
  <source src="/yabsera-hero.mp4" type="video/mp4" />
</video>
</div>

        {/* Floating Badge */}
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 6,
            ease: "easeInOut" 
          }}
          className="absolute -bottom-2 -right-2 z-20 size-12 rounded-2xl bg-white dark:bg-zinc-900 border border-white/20 flex items-center justify-center shadow-2xl"
        >
          <Sparkles className="size-6 text-primary fill-primary/20" />
        </motion.div>
      </motion.div>

      {/* --- TEXT CONTENT --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h1 className="font-heading text-5xl font-bold tracking-tighter sm:text-8xl mb-6 text-glow">
          Yeabsira’s <span className="text-primary">Gallery</span>
        </h1>
          
        <p className="mx-auto max-w-lg text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed font-sans px-4">
          {user 
            ? "Welcome back, Yeabsira. Your sanctuary of beautiful moments is ready." 
            : "A private sanctuary for your most cherished memories. Relive your journey, beautifully preserved."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {user ? (
            <>
              <Button 
                size="lg" 
                className="h-14 px-10 rounded-full shadow-lg shadow-primary/20 text-base"
                onClick={() => router.push("/upload")}
              >
                <Upload className="mr-2 size-5" /> Add New Memory
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-10 rounded-full border-white/10 backdrop-blur-md text-base"
                onClick={() => router.push("/gallery")}
              >
                Go to Gallery <ArrowRight className="ml-2 size-5" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="lg" 
                className="h-14 px-12 rounded-full shadow-lg shadow-primary/20 text-base"
                onClick={() => router.push("/login")}
              >
                Enter Gallery
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-12 rounded-full border-white/10 text-base"
                onClick={() => router.push("/about")}
              >
                About
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}