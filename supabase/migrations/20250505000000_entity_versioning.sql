
-- Create table to store entity versions
CREATE TABLE IF NOT EXISTS entity_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  version_data JSONB NOT NULL DEFAULT '{}',
  book_id UUID REFERENCES books(id),
  message_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster lookups by entity ID and type
CREATE INDEX IF NOT EXISTS entity_versions_entity_idx ON entity_versions (entity_id, entity_type);
CREATE INDEX IF NOT EXISTS entity_versions_book_idx ON entity_versions (book_id);

-- Enable row-level security
ALTER TABLE entity_versions ENABLE ROW LEVEL SECURITY;

-- Add field to books table to store entity version references
ALTER TABLE books ADD COLUMN IF NOT EXISTS current_entity_versions JSONB DEFAULT '{}';

-- Add field to books table to store chat checkpoints
ALTER TABLE books ADD COLUMN IF NOT EXISTS chat_checkpoints JSONB DEFAULT '[]';
