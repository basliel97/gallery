import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, key };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components may not be able to write cookies.
        }
      },
    },
  });
}

export interface PhotoWithUrl {
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

const BATCH_SIZE = 10;

export async function getPhotosWithSignedUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  options?: { limit?: number; offset?: number; search?: string }
) {
  const { limit = 50, offset = 0, search } = options ?? {};

  let query = supabase
    .from("photos")
    .select("id, file_path, created_at, camera, lens, iso, aperture, shutter_speed, focal_length, width, height, file_size, date_taken")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike("file_path", `%${search}%`);
  }

  const { data: rows, error } = await query;

  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  const batches: string[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE).map((r) => r.file_path));
  }

  const results = await Promise.all(
    batches.map(async (paths) => {
      const { data: signedUrls } = await supabase.storage
        .from("photos")
        .createSignedUrls(paths, 3600);
      return signedUrls ?? [];
    })
  );

  const urlMap = new Map<string, string>();
  results.flat().forEach((item) => {
    if (item?.signedUrl && item?.path) {
      urlMap.set(item.path, item.signedUrl);
    }
  });

  return rows.map((photo) => ({
    ...photo,
    signedUrl: urlMap.get(photo.file_path) ?? null,
  })) as PhotoWithUrl[];
}
