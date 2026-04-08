"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderPlus, Folder, Loader2 } from "lucide-react";

interface Album {
  id: string;
  name: string;
}

interface AlbumSelectorProps {
  photoIds: string[];
  onSuccess?: () => void;
}

export function AlbumSelector({ photoIds, onSuccess }: AlbumSelectorProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAlbums();
    }
  }, [open]);

  async function fetchAlbums() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("albums")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setAlbums(data ?? []);
    } catch (err) {
      console.error("Failed to fetch albums:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToAlbum(albumId: string) {
    setAdding(true);
    try {
      const records = photoIds.map((photo_id) => ({ photo_id, album_id: albumId }));
      const { error } = await supabase.from("photo_albums").upsert(records, { onConflict: "photo_id,album_id" });

      if (error) throw error;

      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to add to album:", err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="rounded-2xl h-12 flex-col gap-0 text-[10px] flex-1">
          <FolderPlus className="size-4 mb-1" />
          Add to Album
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Album</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-zinc-400" />
          </div>
        ) : albums.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            No albums yet. Create one first.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => handleAddToAlbum(album.id)}
                disabled={adding}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-muted disabled:opacity-50"
              >
                <Folder className="size-5 text-zinc-400" />
                <span className="font-medium">{album.name}</span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}