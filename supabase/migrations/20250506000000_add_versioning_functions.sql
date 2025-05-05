
-- Create a function to store entity versions without requiring a direct table
CREATE OR REPLACE FUNCTION public.store_entity_version(
  version_id UUID,
  entity_id UUID,
  entity_type TEXT,
  version_data JSONB,
  book_id UUID,
  message_id TEXT DEFAULT NULL,
  version_description TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Store entity version in JSON format in an attribute table
  INSERT INTO public.entity_versions (
    id,
    entity_id,
    entity_type,
    version_data,
    book_id,
    message_id,
    description,
    created_at
  ) VALUES (
    version_id,
    entity_id,
    entity_type,
    version_data,
    book_id,
    message_id,
    version_description,
    NOW()
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error storing entity version: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Create a function to retrieve entity versions for a book
CREATE OR REPLACE FUNCTION public.get_entity_versions_for_book(book_id_param UUID)
RETURNS TABLE (
  id UUID,
  entity_id UUID,
  entity_type TEXT,
  version_data JSONB,
  created_at TIMESTAMPTZ,
  message_id TEXT,
  description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ev.id,
    ev.entity_id,
    ev.entity_type,
    ev.version_data,
    ev.created_at,
    ev.message_id,
    ev.description
  FROM 
    public.entity_versions ev
  WHERE 
    ev.book_id = book_id_param
  ORDER BY 
    ev.created_at DESC;
END;
$$;

-- Create entity_versions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.entity_versions (
  id UUID PRIMARY KEY,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  version_data JSONB NOT NULL,
  book_id UUID REFERENCES public.books(id),
  message_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups by book
CREATE INDEX IF NOT EXISTS idx_entity_versions_book_id ON public.entity_versions(book_id);

-- Create index for faster lookups by entity
CREATE INDEX IF NOT EXISTS idx_entity_versions_entity ON public.entity_versions(entity_id, entity_type);
