"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotosPaginationProps {
  currentPage: number;
  totalPages: number;
  search: string;
}

export function PhotosPagination({ currentPage, totalPages, search }: PhotosPaginationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    if (search) {
      params.set("search", search);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="size-8"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {getPageNumbers().map((page, idx) =>
        typeof page === "number" ? (
          <Button
            key={idx}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            onClick={() => goToPage(page)}
            className="size-8"
          >
            {page}
          </Button>
        ) : (
          <span key={idx} className="px-2 text-zinc-400">
            {page}
          </span>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="size-8"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}