
import { useState, useCallback, useEffect } from 'react';
import { useNovel } from "@/contexts/NovelContext";
import { fetchEntityChatHistory } from "@/services/supabase-sync";
import { ChatMessage } from '@/types/novel';
import { toast } from 'sonner';

export function useEntityChat(entityType?: string | null, entityId?: string | null) {
  const { project, addChatMessage, associateChatWithEntity } = useNovel();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  // Load chat history for the entity when it changes
  useEffect(() => {
    if (entityType && entityId && !hasLoadedHistory) {
      const loadEntityChat = async () => {
        setIsLoading(true);
        try {
          const chatHistory = await fetchEntityChatHistory(entityType, entityId);
          if (chatHistory && chatHistory.length > 0) {
            // Use the associateChatWithEntity function to load the history
            await associateChatWithEntity(entityType, entityId);
            setHasLoadedHistory(true);
          }
        } catch (error) {
          console.error('Error loading entity chat:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadEntityChat();
    }
  }, [entityType, entityId, associateChatWithEntity, hasLoadedHistory]);

  // Function to link current chat to entity
  const linkChatToEntity = useCallback((type: string, id: string) => {
    if (!type || !id) return;
    
    associateChatWithEntity(type, id);
    toast.success(`Chat is now linked to this ${type}`);
  }, [associateChatWithEntity]);

  // Function to clear entity association
  const unlinkChat = useCallback(() => {
    // Clear the current chat context
    if (project.currentChatContext) {
      addChatMessage({
        role: 'system',
        content: `Chat unlinked from ${project.currentChatContext.entityType}`,
      });
      
      // Remove the context
      associateChatWithEntity('', '');
    }
  }, [project.currentChatContext, addChatMessage, associateChatWithEntity]);

  // Function to get entity-specific chat messages
  const getEntityMessages = useCallback((type: string, id: string): ChatMessage[] => {
    if (!type || !id) return [];
    
    return project.chatHistory.filter(
      msg => msg.entityType === type && msg.entityId === id
    );
  }, [project.chatHistory]);

  return {
    isLoading,
    currentEntityType: project.currentChatContext?.entityType || null,
    currentEntityId: project.currentChatContext?.entityId || null,
    linkChatToEntity,
    unlinkChat,
    getEntityMessages,
    hasLoadedHistory,
  };
}
