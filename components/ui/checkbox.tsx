"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base style: transparent with white border so it's visible on photos
        "peer size-5 shrink-0 rounded-md border-2 border-white/80 transition-all outline-none shadow-md",
        // Checked style: Vibrant Orange Background
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        // Hover state
        "hover:border-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center")}
      >
        {/* Thick white checkmark for maximum visibility */}
        <Check className="size-3.5 text-white stroke-[4px]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };