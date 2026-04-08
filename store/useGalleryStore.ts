import { create } from "zustand";

export interface SelectedPhoto {
  id: string;
  file_path: string;
}

interface GalleryStoreState {
  isSelectMode: boolean;
  selectedPhotos: SelectedPhoto[];
}

interface GalleryStoreActions {
  toggleSelectMode: () => void;
  togglePhotoSelection: (photo: SelectedPhoto) => void;
  clearSelection: () => void;
}

type GalleryStore = GalleryStoreState & GalleryStoreActions;

export const useGalleryStore = create<GalleryStore>((set) => ({
  isSelectMode: false,
  selectedPhotos: [],

  toggleSelectMode: () =>
    set((state) => {
      const nextIsSelectMode = !state.isSelectMode;
      return {
        isSelectMode: nextIsSelectMode,
        selectedPhotos: nextIsSelectMode ? state.selectedPhotos : [],
      };
    }),

  togglePhotoSelection: (photo) =>
    set((state) => {
      const alreadySelected = state.selectedPhotos.some(
        (selected) => selected.id === photo.id
      );

      if (alreadySelected) {
        return {
          selectedPhotos: state.selectedPhotos.filter(
            (selected) => selected.id !== photo.id
          ),
        };
      }

      return {
        selectedPhotos: [...state.selectedPhotos, photo],
      };
    }),

  clearSelection: () => set({ selectedPhotos: [] }),
}));
