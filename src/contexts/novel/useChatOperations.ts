
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ChatMessage, NovelProject } from "@/types/novel";

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
  };

  const clearChatHistory = () => {
    setProject((prev) => ({
      ...prev,
      chatHistory: []
    }));
    toast.success("Chat history cleared");
  };

  return {
    addChatMessage,
    clearChatHistory
  };
}
