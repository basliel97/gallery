-- Schema migrations for photo metadata and albums
-- Run these in your Supabase SQL editor

-- 1. Add metadata columns to photos table
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS camera TEXT,
ADD COLUMN IF NOT EXISTS lens TEXT,
ADD COLUMN IF NOT EXISTS iso INTEGER,
ADD COLUMN IF NOT EXISTS aperture TEXT,
ADD COLUMN IF NOT EXISTS shutter_speed TEXT,
ADD COLUMN IF NOT EXISTS focal_length TEXT,
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS date_taken TIMESTAMPTZ;

-- 2. Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create photo_albums junction table (many-to-many)
CREATE TABLE IF NOT EXISTS photo_albums (
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (photo_id, album_id)
);

-- 4. Enable Row Level Security
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for albums
CREATE POLICY "Users can manage their own albums" ON albums
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their photo-album associations" ON photo_albums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photo_albums.album_id
      AND albums.user_id = auth.uid()
    )
  );

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_photos_user_id_date_taken ON photos(user_id, date_taken DESC);
CREATE INDEX IF NOT EXISTS idx_photos_user_id_created_at ON photos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_album_id ON photo_albums(album_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_photo_id ON photo_albums(photo_id);

-- 7. Add updated_at trigger for albums
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();