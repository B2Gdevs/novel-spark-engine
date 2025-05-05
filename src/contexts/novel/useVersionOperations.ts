
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
  const addEntityVersion = (
    entityType: 'character' | 'scene' | 'page' | 'place' | 'event',
    entityId: string,
    entityData: any,
    messageId?: string,
    description?: string
  ) => {
    ensureVersionsArray();
    
    const newVersion: EntityVersion = {
      id: uuidv4(),
      entityId,
      entityType,
      versionData: entityData,
      createdAt: new Date().toISOString(),
      messageId,
      description: description || `${entityType} ${entityData.name || entityData.title} updated`
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
        }, { onConflict: 'id' })
        .select();
        
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

  return {
    addEntityVersion,
    getEntityVersions,
    restoreEntityVersion,
    createChatCheckpoint,
    restoreChatCheckpoint,
    loadVersionsFromSupabase
  };
}
