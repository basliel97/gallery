"use client";

import { motion } from "framer-motion";
import { Camera, Video, Send, ExternalLink, Sparkles } from "lucide-react";

export default function ContactPage() {
  const socials = [
    {
      name: "Instagram",
      username: "@yeabsira_",
      icon: Camera,
      href: "https://www.instagram.com/yeabsira.yohannes/",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_#E1306C]",
      iconColor: "text-pink-500",
      bgGradient: "from-purple-600/20 via-pink-500/20 to-orange-400/20",
    },
    {
      name: "TikTok",
      username: "@yeabsira",
      icon: Video,
      href: "https://tiktok.com/@yeabsira",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_#2af5ff]",
      iconColor: "text-zinc-100",
      bgGradient: "from-zinc-500/20 via-zinc-800/20 to-black/20",
    },
    {
      name: "Telegram",
      username: "@yeabsira",
      icon: Send,
      href: "https://t.me/Jappy1jon",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_#229ED9]",
      iconColor: "text-blue-400",
      bgGradient: "from-blue-600/20 via-blue-400/20 to-cyan-400/20",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 max-w-6xl mx-auto px-4">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center space-y-4 mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-widest mb-2">
          <Sparkles className="size-3" /> Digital Presence
        </div>
        <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight">Connect with <span className="text-primary">Yeabsira</span></h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">Discover more moments and stories across my digital spaces.</p>
      </motion.div>

      {/* Grid: 1 column on mobile, 3 columns on PC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {socials.map((social, index) => (
          <motion.a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -8 }}
            className={`group relative block h-64 rounded-[2rem] border border-white/10 bg-zinc-900/40 p-8 transition-all duration-500 backdrop-blur-md ${social.glowColor}`}
          >
            {/* Hover Background Gradient */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] bg-gradient-to-br ${social.bgGradient}`} />

            <div className="relative h-full flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className={`flex size-14 items-center justify-center rounded-2xl bg-zinc-800/50 border border-white/5 group-hover:border-white/20 transition-colors`}>
                  <social.icon className={`size-7 ${social.iconColor}`} />
                </div>
                <ExternalLink className="size-5 text-zinc-600 group-hover:text-white transition-colors" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{social.name}</h3>
                <p className="text-zinc-400 group-hover:text-white/80 transition-colors font-medium">{social.username}</p>
              </div>
            </div>

            {/* Subtle decorative circle */}
            <div className="absolute -bottom-4 -right-4 size-24 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </motion.a>
        ))}
      </div>

      {/* Footer text */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 text-zinc-500 text-sm font-medium"
      >
        Always open for new collaborations and stories.
      </motion.p>
    </div>
  );
}