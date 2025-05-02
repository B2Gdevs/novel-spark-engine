
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, NovelProject } from '@/types/novel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { saveEntityChatHistory, fetchEntityChatHistory } from '@/services/supabase-sync';

export function useChatOperations(
  project: NovelProject,
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>
) {
  const addChatMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
      entityType: message.entityType || null,
      entityId: message.entityId || null
    };
    
    setProject(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage]
    }));
    
    // If this chat is linked to an entity, save it to database
    if (newMessage.entityType && newMessage.entityId && project.currentBookId) {
      // Get all messages for this entity
      const entityMessages = [...project.chatHistory, newMessage].filter(
        msg => msg.entityType === newMessage.entityType && msg.entityId === newMessage.entityId
      );
      
      // Save to Supabase in background
      saveEntityChatHistory(
        newMessage.entityType,
        newMessage.entityId,
        project.currentBookId,
        entityMessages
      ).catch(error => console.error("Failed to sync entity chat history:", error));
    }
  };
  
  const clearChatHistory = () => {
    setProject(prev => ({
      ...prev,
      chatHistory: []
    }));
    toast.success("Chat history cleared");
  };

  const associateChatWithEntity = async (entityType: string, entityId: string) => {
    // Update all future messages to be associated with this entity
    setProject(prev => ({
      ...prev,
      currentChatContext: {
        entityType,
        entityId
      }
    }));
    
    // Try to load previous chat history for this entity
    if (project.currentBookId) {
      try {
        const chatHistory = await fetchEntityChatHistory(entityType, entityId);
        if (chatHistory && chatHistory.length > 0) {
          // Add a system message indicating we've loaded previous chat
          const systemMessage: ChatMessage = {
            id: uuidv4(),
            role: 'system',
            content: `Loaded previous chat history for this ${entityType}`,
            timestamp: Date.now(),
            entityType,
            entityId
          };
          
          setProject(prev => ({
            ...prev,
            chatHistory: [...chatHistory, systemMessage]
          }));
          
          toast.success(`Loaded previous chat history for this ${entityType}`);
        } else {
          // Add a confirmation message
          addChatMessage({
            role: 'system',
            content: `This chat is now linked to ${entityType} with ID: ${entityId}`,
            entityType,
            entityId
          });
        }
      } catch (error) {
        console.error("Error loading entity chat history:", error);
        // Add a confirmation message anyway
        addChatMessage({
          role: 'system',
          content: `This chat is now linked to ${entityType} with ID: ${entityId}`,
          entityType,
          entityId
        });
      }
    } else {
      // Add a confirmation message
      addChatMessage({
        role: 'assistant',
        content: `This chat is now linked to ${entityType} with ID: ${entityId}`,
        entityType,
        entityId
      });
    }
  };

  const rollbackEntity = (entityType: string, entityId: string, version: string) => {
    // This would restore a previous version of an entity
    addChatMessage({
      role: 'assistant',
      content: `Rolled back ${entityType} (ID: ${entityId}) to version ${version}`,
      entityType,
      entityId
    });
    
    toast.success(`Rolled back ${entityType} to previous version`);
  };

  const sendMessageToAI = async (
    userMessage: string,
    chatHistory: ChatMessage[],
    systemPrompt?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      // Format recent messages (last 10) for context
      const recentMessages = chatHistory
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Add the new user message
      recentMessages.push({
        role: 'user',
        content: userMessage
      });

      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          messages: recentMessages,
          systemPrompt
        }
      });
      
      if (error) {
        console.error('Error calling chat-assistant function:', error);
        toast.error("Failed to get AI response");
        return {
          success: false,
          error: error.message
        };
      }
      
      if (data && data.text) {
        return {
          success: true,
          message: data.text
        };
      } else {
        toast.error("Received empty response from AI");
        return {
          success: false,
          error: "Received empty response"
        };
      }
    } catch (error: any) {
      console.error('Error in sendMessageToAI:', error);
      toast.error("Failed to communicate with AI assistant");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };

  return {
    addChatMessage,
    clearChatHistory,
    sendMessageToAI,
    associateChatWithEntity,
    rollbackEntity
  };
}
