import { createClient } from "@/utils/supabase/client";

export interface Album {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_photo_id?: string;
  created_at: string;
  updated_at: string;
  photo_count?: number;
}

export async function getAlbums(): Promise<Album[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createAlbum(name: string, description?: string): Promise<Album> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("albums")
    .insert({
      user_id: user.id,
      name,
      description,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAlbum(id: string, updates: { name?: string; description?: string; cover_photo_id?: string }): Promise<Album> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("albums")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAlbum(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) throw error;
}

export async function addPhotosToAlbum(photoIds: string[], albumId: string): Promise<void> {
  const supabase = createClient();
  
  const records = photoIds.map((photo_id) => ({ photo_id, album_id: albumId }));
  
  const { error } = await supabase
    .from("photo_albums")
    .upsert(records, { onConflict: "photo_id,album_id" });
  
  if (error) throw error;
}

export async function removePhotosFromAlbum(photoIds: string[], albumId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("photo_albums")
    .delete()
    .eq("album_id", albumId)
    .in("photo_id", photoIds);
  
  if (error) throw error;
}

export async function getAlbumPhotos(albumId: string, limit = 50, offset = 0) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("photo_albums")
    .select(`
      photo:photos(
        id,
        file_path,
        created_at,
        camera,
        lens,
        iso,
        aperture,
        shutter_speed,
        focal_length,
        width,
        height,
        file_size,
        date_taken
      )
    `)
    .eq("album_id", albumId)
    .range(offset, offset + limit - 1)
    .order("added_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((item) => item.photo);
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}