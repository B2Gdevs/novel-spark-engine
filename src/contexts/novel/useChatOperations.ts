
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, NovelProject } from '@/types/novel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useChatOperations(
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>
) {
  const addChatMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now() // Change from ISO string to number timestamp
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
      
      // Add AI response to chat history
      if (data && data.text) {
        addChatMessage({
          role: 'assistant',
          content: data.text
        });
        
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

  return {
    addChatMessage,
    clearChatHistory,
    sendMessageToAI
  };
}
