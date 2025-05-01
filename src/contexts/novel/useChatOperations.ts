
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ChatMessage, NovelProject } from "@/types/novel";
import { supabase } from "@/integrations/supabase/client";

export function useChatOperations(setProject: React.Dispatch<React.SetStateAction<NovelProject>>) {
  const addChatMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage = { 
      ...message, 
      id: uuidv4(),
      timestamp: Date.now()
    };
    
    setProject((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage]
    }));

    return newMessage;
  };

  const clearChatHistory = () => {
    setProject((prev) => ({
      ...prev,
      chatHistory: []
    }));
    toast.success("Chat history cleared");
  };

  const sendMessageToAI = async (
    userMessage: string, 
    chatHistory: ChatMessage[],
    systemPrompt?: string
  ) => {
    // Add user message to chat
    const newUserMessage = addChatMessage({
      role: "user",
      content: userMessage
    });
    
    try {
      // Call Supabase edge function
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          messages: [...chatHistory, newUserMessage],
          systemPrompt
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add AI response to chat
      addChatMessage({
        role: "assistant",
        content: data.text
      });

      return {
        success: true,
        message: data.text
      };
    } catch (error) {
      console.error("Error sending message to AI:", error);
      
      toast.error(`Failed to get AI response: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  return {
    addChatMessage,
    clearChatHistory,
    sendMessageToAI
  };
}
