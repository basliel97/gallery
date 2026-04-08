import { createClient } from "@/utils/supabase/server";
import GalleryGrid from "@/components/GalleryGrid";
import { LandingHero } from "@/components/LandingHero";
import { Sparkles } from "lucide-react";

export default async function Page() {
  const supabase = await createClient();

  // 1. Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch photos if user is logged in
  let photosWithUrls: any[] = [];
  if (user) {
    const { data: photosData } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8); // Just show the most recent 8 on the home page

    photosWithUrls = await Promise.all(
      (photosData || []).map(async (photo) => {
        const { data } = await supabase.storage
          .from("photos")
          .createSignedUrl(photo.file_path, 3600);
        return { ...photo, signedUrl: data?.signedUrl || "" };
      })
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {/* The Hero Section (Pass user to change buttons if logged in) */}
      <LandingHero user={user} />

      {/* 3. Conditional Gallery Section */}
      {user && photosWithUrls.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-2 px-4 text-primary">
              <Sparkles className="size-5" /> Recent Memories
            </h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          
          <GalleryGrid photos={photosWithUrls} />
          
          <div className="mt-10 text-center">
            <a href="/gallery" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              View full collection →
            </a>
          </div>
        </section>
      )}
    </div>
  );
}