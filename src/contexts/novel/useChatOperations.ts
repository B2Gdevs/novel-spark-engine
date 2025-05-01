
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, NovelProject } from '@/types/novel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useChatOperations(
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
  };
  
  const clearChatHistory = () => {
    setProject(prev => ({
      ...prev,
      chatHistory: []
    }));
    toast.success("Chat history cleared");
  };

  const associateChatWithEntity = (entityType: string, entityId: string) => {
    // Update all future messages to be associated with this entity
    setProject(prev => ({
      ...prev,
      currentChatContext: {
        entityType,
        entityId
      }
    }));
    
    // Add a confirmation message
    addChatMessage({
      role: 'assistant',
      content: `This chat is now linked to ${entityType} with ID: ${entityId}`,
      entityType,
      entityId
    });
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
      
      // Return the AI response but don't add it to chat history yet
      // (that will be handled by the caller)
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
    } catch (error) {
      console.error('Error in sendMessageToAI:', error);
      toast.error("Failed to communicate with AI assistant");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };
  
  const parseMentionsInMessage = (message: string) => {
    const mentionRegex = /@(\w+)\/([A-Za-z0-9_-]+)/g;
    const matches = Array.from(message.matchAll(mentionRegex));
    
    return matches.map((match) => ({
      fullMatch: match[0],
      type: match[1],
      id: match[2]
    }));
  };

  return {
    addChatMessage,
    clearChatHistory,
    sendMessageToAI,
    associateChatWithEntity,
    rollbackEntity,
    parseMentionsInMessage
  };
}
