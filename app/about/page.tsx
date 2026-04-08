import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Yeabsira's Gallery",
  description: "Learn more about Yeabsira's Gallery",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl py-12">
      <article className="space-y-8 px-4">
        <header className="text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            The Story
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Behind the Lens
          </h1>
        </header>

        <div className="mx-auto">
          <p className="text-lg leading-relaxed text-foreground/80">
            This space was designed to preserve the beauty of your journey. In a world 
            where moments pass in the blink of an eye, I believe your memories deserve 
            a sanctuary—a place where they can be cherished, revisited, and protected.
          </p>
        </div>

       <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl border border-white/10">
  {/* The Video Element */}
  <video 
    autoPlay 
    loop 
    muted 
    playsInline 
    className="h-full w-full object-cover"
  >
    <source src="/yabsera-hero.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* Optional: A very subtle overlay to keep it feeling consistent with the site theme */}
  <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
</div>

        <div className="mx-auto space-y-6">
          <p className="text-lg leading-relaxed text-foreground/80">
            Every photograph tells a story—of places seen, faces remembered, and emotions 
            felt. This gallery is more than a collection of images; it&apos;s a living 
            archive of your personal journey through time.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            I built this with privacy at its core. Your memories are yours alone, 
            encrypted and safely stored, accessible only to you.
          </p>
        </div>

        <div className="flex justify-center py-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          &mdash; Preserving moments, one frame at a time.
        </p>
      </article>
    </main>
  );
}