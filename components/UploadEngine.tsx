"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import exifr from "exifr";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "failed";
}

interface PhotoMetadata {
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

async function extractMetadata(file: File): Promise<PhotoMetadata> {
  const metadata: PhotoMetadata = {
    file_size: file.size,
  };

  try {
    const exif = await exifr.parse(file, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "ISO",
        "FNumber",
        "ExposureTime",
        "FocalLength",
        "ImageWidth",
        "ImageHeight",
        "DateTimeOriginal",
      ],
    });

    if (exif) {
      if (exif.Make && exif.Model) {
        metadata.camera = `${exif.Make} ${exif.Model}`.trim();
      } else if (exif.Model) {
        metadata.camera = exif.Model;
      }

      if (exif.LensModel) {
        metadata.lens = exif.LensModel;
      }

      if (exif.ISO) {
        metadata.iso = exif.ISO;
      }

      if (exif.FNumber) {
        metadata.aperture = `f/${exif.FNumber}`;
      }

      if (exif.ExposureTime) {
        if (exif.ExposureTime < 1) {
          metadata.shutter_speed = `1/${Math.round(1 / exif.ExposureTime)}s`;
        } else {
          metadata.shutter_speed = `${exif.ExposureTime}s`;
        }
      }

      if (exif.FocalLength) {
        metadata.focal_length = `${Math.round(exif.FocalLength)}mm`;
      }

      if (exif.ImageWidth) {
        metadata.width = exif.ImageWidth;
      }

      if (exif.ImageHeight) {
        metadata.height = exif.ImageHeight;
      }

      if (exif.DateTimeOriginal) {
        metadata.date_taken = exif.DateTimeOriginal.toISOString();
      }
    }
  } catch (err) {
    console.warn("Failed to extract EXIF:", err);
  }

  return metadata;
}

export default function UploadEngine() {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mappedFiles = acceptedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending" as const,
    }));

    setQueuedFiles((prev) => [...prev, ...mappedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: true,
    disabled: uploading,
  });

  const progressValue = useMemo(() => {
    if (batchTotal === 0) return 0;
    return Math.round((completedCount / batchTotal) * 100);
  }, [batchTotal, completedCount]);

  const failedCount = useMemo(
    () => queuedFiles.filter((item) => item.status === "failed").length,
    [queuedFiles]
  );

  const clearQueue = useCallback(() => {
    queuedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setQueuedFiles([]);
    setCompletedCount(0);
    setBatchTotal(0);
  }, [queuedFiles]);

  const removeFile = useCallback((id: string) => {
    setQueuedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  useEffect(() => {
    return () => {
      queuedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [queuedFiles]);

  const runUpload = useCallback(
    async (targetStatus: "all" | "failed") => {
      if (queuedFiles.length === 0 || uploading) return;

      const targets =
        targetStatus === "all"
          ? queuedFiles
          : queuedFiles.filter((item) => item.status === "failed");

      if (targets.length === 0) {
        toast.error("No failed files to retry.");
        return;
      }

      setUploading(true);
      setCompletedCount(0);
      setBatchTotal(targets.length);

      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("You must be signed in to upload photos.");
        }

        let failures = 0;
        const succeededIds: string[] = [];
        let firstFailureMessage = "";

        for (const item of targets) {
          try {
            const metadata = await extractMetadata(item.file);

            const compressedFile = await imageCompression(item.file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: "image/jpeg",
            });

            const filePath = `${user.id}/${crypto.randomUUID()}.jpg`;

            const { error: uploadError } = await supabase.storage
              .from("photos")
              .upload(filePath, compressedFile, {
                contentType: "image/jpeg",
                upsert: false,
              });

            if (uploadError) throw uploadError;

            const { error: insertError } = await supabase
              .from("photos")
              .insert({
                file_path: filePath,
                user_id: user.id,
                camera: metadata.camera,
                lens: metadata.lens,
                iso: metadata.iso,
                aperture: metadata.aperture,
                shutter_speed: metadata.shutter_speed,
                focal_length: metadata.focal_length,
                width: metadata.width,
                height: metadata.height,
                file_size: metadata.file_size,
                date_taken: metadata.date_taken,
              });

            if (insertError) throw insertError;
            succeededIds.push(item.id);
          } catch (error) {
            failures += 1;
            if (!firstFailureMessage) {
              firstFailureMessage =
                error instanceof Error ? error.message : "Unknown upload error.";
            }
            setQueuedFiles((prev) =>
              prev.map((queued) =>
                queued.id === item.id ? { ...queued, status: "failed" } : queued
              )
            );
          } finally {
            setCompletedCount((prev) => prev + 1);
          }
        }

        if (succeededIds.length > 0) {
          setQueuedFiles((prev) => {
            const failed = prev.filter((item) => !succeededIds.includes(item.id));
            prev
              .filter((item) => succeededIds.includes(item.id))
              .forEach((item) => URL.revokeObjectURL(item.previewUrl));
            return failed;
          });
        }

        if (failures > 0) {
          toast.error(
            `Uploaded with ${failures} failed file(s). ${firstFailureMessage}`
          );
          return;
        }

        toast.success("All photos uploaded successfully.");
        clearQueue();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to upload photos.";
        toast.error(message);
      } finally {
        setUploading(false);
      }
    },
    [clearQueue, queuedFiles, uploading]
  );

  return (
    <div className="space-y-5">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-3xl border border-dashed border-rose-300/80 bg-white/70 p-8 text-center transition-colors hover:bg-rose-50/80 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:bg-zinc-900"
      >
        <input {...getInputProps()} />
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200">
          <ImagePlus className="size-6" />
        </div>
        <p className="text-sm font-medium">
          {isDragActive
            ? "Drop your images here..."
            : "Drag and drop images, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Images are automatically compressed before upload.
        </p>
      </div>

      {queuedFiles.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {queuedFiles.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-xl border border-rose-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  disabled={uploading}
                  className="absolute right-1 top-1 z-10 rounded-full bg-black/55 p-1 text-white transition hover:bg-black/70 disabled:opacity-50"
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="size-3.5" />
                </button>
                {item.status === "failed" && (
                  <span className="absolute bottom-1 left-1 z-10 rounded-md bg-red-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Failed
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                {completedCount}/{batchTotal || queuedFiles.length} completed
              </span>
              <span>{progressValue}%</span>
            </div>
            <Progress value={progressValue} />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="h-10 flex-1"
              onClick={() => void runUpload("all")}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  Upload {queuedFiles.length} photo
                  {queuedFiles.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
            {failedCount > 0 && (
              <Button
                type="button"
                variant="secondary"
                className="h-10"
                onClick={() => void runUpload("failed")}
                disabled={uploading}
              >
                Retry failed ({failedCount})
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={clearQueue}
              disabled={uploading}
            >
              Clear
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
