import GalleryGrid, { type GalleryPhoto } from "@/components/GalleryGrid";
import { createClient, getPhotosWithSignedUrls } from "@/utils/supabase/server";
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

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const limit = 24;
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  const { data: countData } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .ilike("file_path", `%${search}%`);

  const totalCount = countData?.length ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const rows = await getPhotosWithSignedUrls(supabase, {
    limit,
    offset,
    search: search || undefined,
  });

  const photos: GalleryPhoto[] = rows
    .filter((photo): photo is PhotoRow & { signedUrl: string } => photo.signedUrl !== null)
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
        <p className="text-sm font-medium text-rose-500 dark:text-rose-300">Gallery</p>
        <h1 className="text-2xl font-semibold tracking-tight">Your collection</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Tap any image to view it in full detail.
        </p>
      </div>
      <SearchBar />
      <GalleryGrid photos={photos} />
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