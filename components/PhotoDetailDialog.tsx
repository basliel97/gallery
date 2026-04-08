"use client";

import { GalleryPhoto } from "@/components/GalleryGrid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Aperture, Timer, Focus, Image, HardDrive, Calendar, Eye } from "lucide-react";

interface PhotoDetailDialogProps {
  photo: GalleryPhoto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDimensions(width?: number, height?: number): string {
  if (!width || !height) return "-";
  return `${width} × ${height}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PhotoDetailDialog({ photo, open, onOpenChange }: PhotoDetailDialogProps) {
  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Photo Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <img
              src={photo.signedUrl}
              alt="Preview"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            {photo.date_taken && (
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-300">
                  {formatDate(photo.date_taken)}
                </span>
              </div>
            )}

            {photo.camera && (
              <div className="flex items-center gap-3">
                <Camera className="size-4 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-300">{photo.camera}</span>
              </div>
            )}

            {photo.lens && (
              <div className="flex items-center gap-3">
                <Focus className="size-4 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-300">{photo.lens}</span>
              </div>
            )}

            <div className="flex gap-4">
              {photo.aperture && (
                <div className="flex items-center gap-2">
                  <Aperture className="size-4 text-zinc-400" />
                  <span className="text-zinc-600 dark:text-zinc-300">{photo.aperture}</span>
                </div>
              )}
              {photo.shutter_speed && (
                <div className="flex items-center gap-2">
                  <Timer className="size-4 text-zinc-400" />
                  <span className="text-zinc-600 dark:text-zinc-300">{photo.shutter_speed}</span>
                </div>
              )}
              {photo.iso && (
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-zinc-400" />
                  <span className="text-zinc-600 dark:text-zinc-300">ISO {photo.iso}</span>
                </div>
              )}
            </div>

            {photo.focal_length && (
              <div className="flex items-center gap-3">
                <Focus className="size-4 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-300">{photo.focal_length}</span>
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Image className="size-4 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-300">
                  {formatDimensions(photo.width, photo.height)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-300">
                  {formatFileSize(photo.file_size)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}