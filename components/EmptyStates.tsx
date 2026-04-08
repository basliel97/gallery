"use client";

import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="rounded-2xl border border-rose-200/70 bg-white/70 px-4 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
        <ImagePlus className="size-8 text-rose-500 dark:text-rose-300" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        No photos yet
      </h3>
      <p className="mb-6 max-w-sm mx-auto text-sm text-zinc-500 dark:text-zinc-400">
        Upload your first images to start building your premium photo collection.
      </p>
      <Link href="/upload">
        <Button>Start uploading</Button>
      </Link>
    </div>
  );
}

export function EmptySearchState({ search }: { search: string }) {
  return (
    <div className="rounded-2xl border border-rose-200/70 bg-white/70 px-4 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
        <ImagePlus className="size-8 text-rose-500 dark:text-rose-300" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        No results found
      </h3>
      <p className="max-w-sm mx-auto text-sm text-zinc-500 dark:text-zinc-400">
        No photos matching &quot;{search}&quot;. Try a different search term.
      </p>
    </div>
  );
}