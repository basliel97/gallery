"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Unable to create account. Please try again.");
      setLoading(false);
      return;
    }

    if (data.session) {
      toast.success("Account created. Welcome!");
      router.replace("/");
      router.refresh();
      return;
    }

    toast.success("Account created. Check your email to confirm your account.");
    router.replace("/login");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#fff1f2] via-white to-white dark:from-[#09090b] dark:via-[#09090b] dark:to-[#09090b]" />
      <div className="absolute -top-40 -right-40 size-80 rounded-full bg-rose-300/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-rose-200/30 blur-3xl dark:bg-rose-500/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/60"
      >
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm font-medium text-rose-500 dark:text-rose-300">Yeabsira&apos;s Gallery</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Create account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Start your private photo collection today.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-white/60 dark:bg-zinc-800/60"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password (min 6 characters)"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-white/60 dark:bg-zinc-800/60"
              required
            />
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="h-11 w-full text-base"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </motion.div>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-rose-600 hover:underline dark:text-rose-300">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-zinc-400 hover:text-rose-500 dark:hover:text-rose-300">
            ← Back to Home
          </Link>
        </p>
      </motion.div>
    </main>
  );
}