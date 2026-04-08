import { notFound } from "next/navigation";
import { createClient, getPhotosWithSignedUrls } from "@/utils/supabase/server";
import GalleryGrid, { type GalleryPhoto } from "@/components/GalleryGrid";
import { SearchBar } from "@/components/SearchBar";
import { PhotosPagination } from "@/components/PhotosPagination";

interface PhotoRow {
  id: string;
  file_path: string;
  created_at: string;
  signedUrl: string | null;
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

export default async function AlbumDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { id: albumId } = await params;
  const searchParamsResolved = await searchParams;
  const page = parseInt(searchParamsResolved.page ?? "1", 10);
  const search = searchParamsResolved.search ?? "";
  const limit = 24;
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  // Get album info
  const { data: album } = await supabase
    .from("albums")
    .select("id, name, description, cover_photo_id")
    .eq("id", albumId)
    .single();

  if (!album) {
    notFound();
  }

  // Get photos in album with signed URLs
  const { data: photoData } = await supabase
    .from("photo_albums")
    .select("photo_id")
    .eq("album_id", albumId);

  const photoIds = (photoData ?? []).map((p) => p.photo_id);

  if (photoIds.length === 0) {
    return (
      <main className="mx-auto w-full max-w-6xl py-6">
        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium text-rose-500 dark:text-rose-300">Album</p>
          <h1 className="text-2xl font-semibold tracking-tight">{album.name}</h1>
          {album.description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{album.description}</p>
          )}
        </div>
        <div className="rounded-2xl border border-rose-200/70 bg-white/70 px-4 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">This album is empty. Add photos from the gallery.</p>
        </div>
      </main>
    );
  }

  // Get photos with pagination
  const { data: photosData } = await supabase
    .from("photos")
    .select("id, file_path, created_at, camera, lens, iso, aperture, shutter_speed, focal_length, width, height, file_size, date_taken")
    .in("id", photoIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!photosData || photosData.length === 0) {
    return (
      <main className="mx-auto w-full max-w-6xl py-6">
        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium text-rose-500 dark:text-rose-300">Album</p>
          <h1 className="text-2xl font-semibold tracking-tight">{album.name}</h1>
        </div>
        <GalleryGrid photos={[]} />
      </main>
    );
  }

  const totalCount = photoIds.length;
  const totalPages = Math.ceil(totalCount / limit);

  // Get signed URLs
  const photos = await getPhotosWithSignedUrls(supabase, {
    limit: photosData.length,
    offset: 0,
  });

  const galleryPhotos: GalleryPhoto[] = photos
    .filter((p): p is PhotoRow & { signedUrl: string } => p.signedUrl !== null)
    .map((photo) => ({
      id: photo.id,
      file_path: photo.file_path,
      signedUrl: photo.signedUrl,
      created_at: photo.created_at,
      camera: photo.camera,
      lens: photo.lens,
      iso: photo.iso,
      aperture: photo.aperture,
      shutter_speed: photo.shutter_speed,
      focal_length: photo.focal_length,
      width: photo.width,
      height: photo.height,
      file_size: photo.file_size,
      date_taken: photo.date_taken,
    }));

  return (
    <main className="mx-auto w-full max-w-6xl py-6">
      <div className="mb-4 space-y-1">
        <p className="text-sm font-medium text-rose-500 dark:text-rose-300">Album</p>
        <h1 className="text-2xl font-semibold tracking-tight">{album.name}</h1>
        {album.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{album.description}</p>
        )}
        <p className="text-xs text-zinc-400">{totalCount} photo{totalCount !== 1 ? "s" : ""}</p>
      </div>
      <SearchBar />
      <GalleryGrid photos={galleryPhotos} albumId={albumId} />
      {totalPages > 1 && (
        <PhotosPagination
          currentPage={page}
          totalPages={totalPages}
          search={search}
        />
      )}
    </main>
  );
}