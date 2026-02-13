-- Add video metadata columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(255);

-- Add comment for clarity
COMMENT ON COLUMN posts.duration IS 'Video duration in seconds';
COMMENT ON COLUMN posts.views_count IS 'Number of video views';
