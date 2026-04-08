import GalleryGrid, { type GalleryPhoto } from "@/components/GalleryGrid";

interface GallerySectionProps {
  photos: GalleryPhoto[];
}

export function GallerySection({ photos }: GallerySectionProps) {
  return <GalleryGrid photos={photos} />;
}