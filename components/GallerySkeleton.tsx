"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function GallerySkeleton() {
  const skeletonItems = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
      {skeletonItems.map((i) => (
        <Skeleton
          key={i}
          className="mb-4 aspect-[3/4] w-full rounded-xl"
          style={{ animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  );
}