import { v4 as uuidv4 } from 'uuid';
import { EntityVersion, NovelProject } from '@/types/novel';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useVersionOperations(
  project: NovelProject,
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>
) {
  // Initialize versions array if it doesn't exist
  const ensureVersionsArray = () => {
    if (!project.entityVersions) {
      setProject(prev => ({
        ...prev,
        entityVersions: []
      }));
    }
  };

  // Add a new version when an entity is created or updated
  const addEntityVersion = async (
    entityType: 'character' | 'scene' | 'page' | 'place' | 'event',
    entityId: string,
    versionData: any,
    messageId?: string,
    description?: string
  ) => {
    ensureVersionsArray();
    
    const newVersion: EntityVersion = {
      id: uuidv4(),
      entityId,
      entityType,
      versionData: versionData,
      createdAt: new Date().toISOString(),
      messageId,
      description: description || `${entityType} ${versionData.name || versionData.title} updated`
    };
    
    setProject(prev => ({
      ...prev,
      entityVersions: [...(prev.entityVersions || []), newVersion]
    }));

    // Save to Supabase in background if we're connected
    saveVersionToSupabase(newVersion, project.currentBookId)
      .catch(error => console.error(`Failed to sync ${entityType} version to database:`, error));
    
    return newVersion.id;
  };

  // Get all versions for a specific entity
  const getEntityVersions = (entityType: string, entityId: string): EntityVersion[] => {
    if (!project.entityVersions) return [];
    
    return project.entityVersions
      .filter(v => v.entityType === entityType && v.entityId === entityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Restore an entity to a specific version
  const restoreEntityVersion = (versionId: string): boolean => {
    if (!project.entityVersions) return false;
    
    const version = project.entityVersions.find(v => v.id === versionId);
    if (!version) return false;
    
    try {
      const { entityType, entityId, versionData } = version;
      
      setProject(prev => {
        const updatedBooks = prev.books.map(book => {
          if (book.id !== prev.currentBookId) return book;
          
          switch (entityType) {
            case 'character':
              return {
                ...book,
                characters: book.characters.map(c => 
                  c.id === entityId ? { ...c, ...versionData, updatedAt: new Date().toISOString() } : c
                )
              };
            case 'scene':
              return {
                ...book,
                scenes: book.scenes.map(s => 
                  s.id === entityId ? { ...s, ...versionData, updatedAt: new Date().toISOString() } : s
                )
              };
            case 'page':
              return {
                ...book,
                pages: book.pages.map(p => 
                  p.id === entityId ? { ...p, ...versionData, updatedAt: new Date().toISOString() } : p
                )
              };
            case 'place':
              if (!book.places) return book;
              return {
                ...book,
                places: book.places.map(p => 
                  p.id === entityId ? { ...p, ...versionData, updatedAt: new Date().toISOString() } : p
                )
              };
            case 'event':
              return {
                ...book,
                events: book.events.map(e => 
                  e.id === entityId ? { ...e, ...versionData, updatedAt: new Date().toISOString() } : e
                )
              };
            default:
              return book;
          }
        });
        
        return {
          ...prev,
          books: updatedBooks
        };
      });
      
      // Add a version restoration message to chat
      const entityName = 
        versionData.name || 
        versionData.title || 
        `${entityType} ${entityId.substring(0, 8)}`;
        
      toast.success(`Restored ${entityType} ${entityName} to previous version`);
      return true;
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error(`Failed to restore ${version.entityType} to previous version`);
      return false;
    }
  };

  // Create a chat checkpoint
  const createChatCheckpoint = (description: string) => {
    const newCheckpoint = {
      id: uuidv4(),
      description,
      timestamp: Date.now(),
      messageIndex: project.chatHistory.length - 1
    };
    
    setProject(prev => ({
      ...prev,
      chatCheckpoints: [...(prev.chatCheckpoints || []), newCheckpoint]
    }));
    
    toast.success('Chat checkpoint created');
    return newCheckpoint.id;
  };

  // Restore chat to a checkpoint
  const restoreChatCheckpoint = (checkpointId: string) => {
    if (!project.chatCheckpoints) return false;
    
    const checkpoint = project.chatCheckpoints.find(c => c.id === checkpointId);
    if (!checkpoint) return false;
    
    // Truncate chat history to the checkpoint
    setProject(prev => ({
      ...prev,
      chatHistory: prev.chatHistory.slice(0, checkpoint.messageIndex + 1),
    }));
    
    toast.success(`Chat restored to checkpoint: ${checkpoint.description}`);
    return true;
  };

  // Save version to Supabase
  const saveVersionToSupabase = async (version: EntityVersion, bookId: string | null) => {
    if (!bookId) return null;
    
    try {
      // Using executeQuery approach to handle custom table not yet in TypeScript definitions
      const { data, error } = await supabase
        .from('entity_versions')
        .upsert({
          id: version.id,
          entity_id: version.entityId,
          entity_type: version.entityType,
          version_data: version.versionData,
          book_id: bookId,
          message_id: version.messageId,
          description: version.description,
          created_at: version.createdAt
        });
        
      if (error) {
        console.error('Error saving entity version:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Exception saving entity version:', error);
      return null;
    }
  };

  // Load versions from Supabase
  const loadVersionsFromSupabase = async (bookId: string) => {
    try {
      // Using executeQuery approach to handle custom table not yet in TypeScript definitions
      const { data, error } = await supabase
        .from('entity_versions')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error loading entity versions:', error);
        return [];
      }
      
      // Transform from snake_case to camelCase
      const versions = data.map(v => ({
        id: v.id,
        entityId: v.entity_id,
        entityType: v.entity_type,
        versionData: v.version_data,
        createdAt: v.created_at,
        messageId: v.message_id,
        description: v.description
      }));
      
      // Update project state with loaded versions
      setProject(prev => ({
        ...prev,
        entityVersions: versions
      }));
      
      return versions;
    } catch (error) {
      console.error('Exception loading entity versions:', error);
      return [];
    }
  };

  // Create a new entity version using RPC function
  const createEntityVersion = async (
    entityType: 'character' | 'scene' | 'page' | 'place' | 'event',
    entityId: string,
    versionData: any,
    messageId?: string,
    description?: string
  ) => {
    // Use RPC function instead of direct table access
    const { data, error } = await supabase.rpc('create_entity_version', {
      p_entity_id: entityId,
      p_entity_type: entityType,
      p_version_data: versionData,
      p_message_id: messageId || null,
      p_description: description || null
    });

    if (error) {
      console.error('Error creating entity version:', error);
      return null;
    }

    return data;
  };

  // Get all versions for a specific entity using RPC function
  const getEntityVersionsForEntity = async (
    entityType: 'character' | 'scene' | 'page' | 'place' | 'event',
    entityId: string
  ) => {
    // Use RPC function instead of direct table access
    const { data, error } = await supabase.rpc('get_entity_versions', {
      p_entity_id: entityId,
      p_entity_type: entityType
    });

    if (error) {
      console.error('Error fetching entity versions:', error);
      return [];
    }

    // Transform the data to match the EntityVersion interface
    return data.map((version: any) => ({
      id: version.id,
      entityId: version.entity_id,
      entityType: version.entity_type,
      versionData: version.version_data,
      createdAt: version.created_at,
      messageId: version.message_id,
      description: version.description
    }));
  };

  return {
    addEntityVersion,
    getEntityVersions,
    restoreEntityVersion,
    createChatCheckpoint,
    restoreChatCheckpoint,
    loadVersionsFromSupabase,
    createEntityVersion,
    getEntityVersionsForEntity
  };
}
