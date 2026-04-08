"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { Plus, FolderOpen, Trash2, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Album {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string; // Added for the dynamic cover
  created_at: string;
}

export default function AlbumsPage() {
  const supabase = createClient();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch albums with a join to get the most recent photo path
      const { data, error } = await supabase
        .from("albums")
        .select(`*, photo_albums(photo:photos(file_path))`)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Generate signed URLs for the covers
      const albumsWithCovers = await Promise.all((data || []).map(async (album: any) => {
        const firstPhotoPath = album.photo_albums?.[0]?.photo?.file_path;
        let coverUrl = "";
        if (firstPhotoPath) {
          const { data: urlData } = await supabase.storage
            .from("photos")
            .createSignedUrl(firstPhotoPath, 3600);
          coverUrl = urlData?.signedUrl || "";
        }
        return { ...album, coverUrl };
      }));

      setAlbums(albumsWithCovers);
    } catch (err) {
      console.error("Failed to fetch albums:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAlbum(e: React.FormEvent) {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("albums")
        .insert({
          user_id: user.id,
          name: newAlbumName.trim(),
          description: newAlbumDesc.trim() || null,
        });

      if (error) throw error;

      setNewAlbumName("");
      setNewAlbumDesc("");
      setDialogOpen(false);
      fetchAlbums();
      toast.success("Album created");
    } catch (err) {
      toast.error("Failed to create album");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteAlbum(id: string) {
    try {
      const { error } = await supabase.from("albums").delete().eq("id", id);
      if (error) throw error;

      setAlbums((prev) => prev.filter((a) => a.id !== id));
      toast.success("Album deleted");
    } catch (err) {
      toast.error("Failed to delete album");
    }
  }

  function confirmDeleteAlbum(id: string) {
    setAlbumToDelete(id);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (albumToDelete) {
      await handleDeleteAlbum(albumToDelete);
      setAlbumToDelete(null);
      setDeleteConfirmOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Albums</h1>
          <p className="text-sm text-muted-foreground">Organize your photos into collections</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Plus className="size-4 mr-1" />
              New Album
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Create Album</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="Album name"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  placeholder="What's this album about?"
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl" disabled={creating || !newAlbumName.trim()}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {albums.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-card/60 px-4 py-12 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <FolderOpen className="size-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">
            No albums yet
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Create your first album to organize your photos.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="rounded-full">
            <Plus className="size-4 mr-1" />
            Create Album
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group relative rounded-3xl border border-white/10 bg-card/60 p-3 shadow-sm transition hover:shadow-md backdrop-blur-xl"
            >
              <Link href={`/albums/${album.id}`} className="block">
                <div className="mb-3 flex aspect-square items-center justify-center rounded-2xl bg-muted overflow-hidden">
                  {album.coverUrl ? (
                    <img 
                      src={album.coverUrl} 
                      alt={album.name} 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <ImageIcon className="size-10 text-muted-foreground/30" />
                  )}
                </div>
                <h3 className="font-medium text-foreground truncate px-1">
                  {album.name}
                </h3>
                {album.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground truncate px-1">
                    {album.description}
                  </p>
                )}
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  confirmDeleteAlbum(album.id);
                }}
                className="absolute right-2 top-2 rounded-full bg-background/80 backdrop-blur-md p-1.5 text-foreground opacity-0 transition hover:bg-destructive hover:text-white group-hover:opacity-100"
                aria-label="Delete album"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Album"
        description="Are you sure you want to delete this album? The photos inside will not be deleted."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}