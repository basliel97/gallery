import UploadEngine from "@/components/UploadEngine";

export default function UploadPage() {
  return (
    <main className="mx-auto w-full max-w-3xl py-6">
      <section className="rounded-3xl border border-white/10 bg-card/60 p-5 shadow-lg backdrop-blur-xl sm:p-6">
        <div className="mb-5 space-y-1">
          <p className="text-sm font-medium text-primary">Upload</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add new photos</h1>
          <p className="text-sm text-muted-foreground">
            Drop multiple images, compress automatically, and upload them securely.
          </p>
        </div>
        <UploadEngine />
      </section>
    </main>
  );
}