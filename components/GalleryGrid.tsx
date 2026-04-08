"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { useGalleryStore } from "@/store/useGalleryStore";
import { AlbumSelector } from "@/components/AlbumSelector";
import { PhotoDetailDialog } from "@/components/PhotoDetailDialog";
import { Download, MoreHorizontal, Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

export interface GalleryPhoto {
  id: string;
  file_path: string;
  signedUrl: string;
  created_at?: string;
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutter_speed?: string;
  focal_length?: string;
  width?: number;
  height?: number;
  file_size?: number;
  date_taken?: string;
}

interface GalleryGridProps {
  photos: GalleryPhoto[];
  albumId?: string;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFileName = (path: string) => {
  const parts = path.split("/");
  return parts[parts.length - 1] || "Photo";
};

export default function GalleryGrid({ photos, albumId }: GalleryGridProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [detailPhoto, setDetailPhoto] = useState<GalleryPhoto | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const deletedPhotosRef = useRef<{ ids: string[]; filePaths: string[] } | null>(null);
  const {
    isSelectMode,
    selectedPhotos,
    toggleSelectMode,
    togglePhotoSelection,
  } = useGalleryStore();

  const slides = useMemo(
    () =>
      photos.map((photo) => ({
        src: photo.signedUrl,
      })),
    [photos]
  );
  const selectedIds = useMemo(
    () => new Set(selectedPhotos.map((photo) => photo.id)),
    [selectedPhotos]
  );

  const handleDelete = async (showUndo = true) => {
    if (selectedPhotos.length === 0 || deleting) return;

    const ids = selectedPhotos.map((photo) => photo.id);
    const filePaths = selectedPhotos.map((photo) => photo.file_path);

    if (showUndo) {
      deletedPhotosRef.current = { ids, filePaths };
    }

    setDeleting(true);
    try {
      const supabase = createClient();

      const { error: storageError } = await supabase.storage
        .from("photos")
        .remove(filePaths);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from("photos").delete().in("id", ids);
      if (dbError) throw dbError;

      router.refresh();
      toggleSelectMode();

      if (showUndo) {
        toast.success(
          <div className="flex items-center gap-2">
            <span>Deleted {ids.length} photo(s)</span>
            <button
              onClick={() => handleUndoDelete()}
              className="font-medium text-rose-600 hover:underline"
            >
              Undo
            </button>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.success("Photos deleted successfully.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete selected photos.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleUndoDelete = async () => {
    if (!deletedPhotosRef.current || deleting) return;

    const { ids, filePaths } = deletedPhotosRef.current;
    deletedPhotosRef.current = null;

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    setDeleting(true);
    try {
      const supabase = createClient();

      for (let i = 0; i < filePaths.length; i++) {
        const { error: insertError } = await supabase.from("photos").insert({
          id: ids[i],
          file_path: filePaths[i],
        });
        if (insertError) throw insertError;
      }

      router.refresh();
      toast.success("Photos restored");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to restore photos.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDownload = async (selected: typeof selectedPhotos) => {
    if (selected.length === 0 || downloading) return;

    setDownloading(true);
    try {
      const supabase = createClient();
      const filePaths = selected.map((photo) => photo.file_path);

      const { data: urls, error: urlError } = await supabase.storage
        .from("photos")
        .createSignedUrls(filePaths, 3600);

      if (urlError || !urls) throw urlError || new Error("Failed to get download URLs");

      for (const urlData of urls) {
        if (!urlData?.signedUrl || !urlData?.path) continue;
        
        const response = await fetch(urlData.signedUrl);
        const blob = await response.blob();
        const filename = urlData.path.split("/").pop() || "photo.jpg";
        
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      toast.success(`Downloaded ${selected.length} photo(s)`);
      toggleSelectMode();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download photos.";
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200/70 bg-white/70 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        No photos yet. Upload your first images to fill your gallery.
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <Button type="button" variant={isSelectMode ? "default" : "outline"} onClick={toggleSelectMode}>
          {isSelectMode ? "Cancel" : "Select"}
        </Button>
      </div>

      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {photos.map((photo, photoIndex) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: photoIndex * 0.1,
              ease: "easeOut",
            }}
            className="mb-4 break-inside-avoid"
          >
            <button
              type="button"
              onClick={() => {
                if (isSelectMode) {
                  togglePhotoSelection({ id: photo.id, file_path: photo.file_path });
                  return;
                }
                setIndex(photoIndex);
                setOpen(true);
              }}
              className="group relative block w-full overflow-hidden rounded-xl border border-rose-200/60 bg-white shadow-sm transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              {isSelectMode && (
                <span
                  className="absolute right-2 top-2 z-20 rounded-md bg-white/85 p-1 backdrop-blur dark:bg-zinc-900/85"
                  onClick={(event) => {
                    event.stopPropagation();
                    togglePhotoSelection({ id: photo.id, file_path: photo.file_path });
                  }}
                >
                  <Checkbox checked={selectedIds.has(photo.id)} />
                </span>
              )}
              {!isSelectMode && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setDetailPhoto(photo);
                  }}
                  className="absolute right-2 top-2 z-10 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
                  aria-label="Photo details"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              )}
              <div className="relative aspect-[3/4]">
                <Image
                  src={photo.signedUrl}
                  alt={`Gallery photo ${photoIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
  {selectedPhotos.length > 0 && (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      // Note: bottom-24 keeps it above the BottomNav
      className="fixed inset-x-0 bottom-24 z-40 mx-auto px-4 w-full max-w-md"
    >
      <div className="flex flex-col gap-2 p-3 rounded-3xl border border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl">
        
        {/* Statistics row */}
        <div className="px-2 py-1 text-center">
          <span className="text-xs font-medium text-primary uppercase tracking-widest">
            {selectedPhotos.length} item{selectedPhotos.length > 1 ? 's' : ''} selected
          </span>
        </div>

        {/* Buttons row - Grid on mobile, Flex on desktop */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-2xl h-12 flex-col gap-0 text-[10px]"
            onClick={() => handleBulkDownload(selectedPhotos)}
          >
            <Download className="size-4 mb-1" /> Download
          </Button>

          <AlbumSelector
            photoIds={selectedPhotos.map((p) => p.id)}
            onSuccess={() => toggleSelectMode()}
            // Tip: Ensure AlbumSelector button also matches this style
          />

          <Button
            variant="destructive"
            size="sm"
            className="rounded-2xl h-12 flex-col gap-0 text-[10px]"
            onClick={() => setIsDeleteConfirmOpen(true)} // Open confirm dialog instead of deleting instantly
          >
            <Trash2 className="size-4 mb-1" /> Delete
          </Button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides.map((slide, i) => {
          const photo = photos[i];
          const metaParts: string[] = [];
          if (photo?.camera) metaParts.push(photo.camera);
          if (photo?.lens) metaParts.push(photo.lens);
          
          const techParts: string[] = [];
          if (photo?.aperture) techParts.push(photo.aperture);
          if (photo?.shutter_speed) techParts.push(photo.shutter_speed);
          if (photo?.iso) techParts.push(`ISO ${photo.iso}`);
          if (photo?.focal_length) techParts.push(photo.focal_length);
          if (photo?.width && photo?.height) techParts.push(`${photo.width}×${photo.height}`);
          if (photo?.file_size != null) techParts.push(formatFileSize(photo.file_size)!);

          return {
            ...slide,
            title: photo?.date_taken ? formatDate(photo.date_taken) : (photo?.created_at ? formatDate(photo.created_at) : undefined),
            description: [
              photo?.file_path ? getFileName(photo.file_path) : null,
              metaParts.length > 0 ? metaParts.join(" · ") : null,
              techParts.length > 0 ? techParts.join(" · ") : null,
            ].filter(Boolean).join("\n") || undefined,
          };
        })}
        controller={{ closeOnBackdropClick: true }}
        animation={{ fade: 250, swipe: 250 }}
        styles={{ container: { backgroundColor: "rgba(0,0,0,0.95)" } }}
        carousel={{ preload: 2 }}
        on={{ view: ({ index: viewIndex }) => setIndex(viewIndex) }}
      />

      <PhotoDetailDialog
        photo={detailPhoto}
        open={!!detailPhoto}
        onOpenChange={(open) => !open && setDetailPhoto(null)}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          handleDelete(true);
          setIsDeleteConfirmOpen(false);
        }}
        title="Delete Memories?"
        description={`Are you sure you want to delete ${selectedPhotos.length} photos? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleting}
      />
    </>
  );
}
