import { useState, useEffect, useCallback } from "react";
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { Character, Scene } from "@/types/novel";

// Define the type for chat messages
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: any;
};

// Define the type for detected entities
export type DetectedEntity = {
  type: string;
  id: string;
  name: string;
  fullText: string;
  bookId: string;
  bookTitle: string;
};

// Custom hook for handling chat submissions and managing chat state
export function useChatSubmission() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedEntities, setDetectedEntities] = useState<DetectedEntity[] | null>(null);
  const { currentBook } = useNovel();

  // Function to clear the chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    toast.success("Chat history cleared");
  }, []);

  // Function to handle sending a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    
    // Optimistically update the chat with the user's message
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      // Prepare the request body
      const requestBody = {
        messages: [...messages, userMessage],
        query: input,
        context: {
          bookId: currentBook?.id,
          bookTitle: currentBook?.title,
        },
      };

      // Make the API request
      const response = await fetch("/api/copilotkit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.reply) {
        // Create the assistant's reply message
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
        };

        // Update the chat with the assistant's reply
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Extract and set detected entities
        if (data.entities) {
          setDetectedEntities(data.entities);
        } else {
          setDetectedEntities(null);
        }
      } else {
        toast.error("No reply received from the assistant.");
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to process referenced entities and create system messages
  const processReferencedEntities = () => {
    if (!detectedEntities || detectedEntities.length === 0) return [];
    
    // Transform entities to match ChatMessage type
    return detectedEntities.map(entity => ({
      role: "system" as const,
      content: `Referenced ${entity.type}: ${entity.name}`,
      timestamp: new Date().toISOString(),
      metadata: {
        type: entity.type,
        id: entity.id,
        name: entity.name,
        fullText: entity.fullText,
        bookId: entity.bookId,
        bookTitle: entity.bookTitle
      }
    }));
  };

  // Effect to prepend referenced entities to the chat messages
  useEffect(() => {
    if (detectedEntities && detectedEntities.length > 0) {
      const entityMessages = processReferencedEntities();
      setMessages(prev => [...entityMessages, ...prev]);
      setDetectedEntities(null); // Clear detected entities after processing
    }
  }, [detectedEntities, processReferencedEntities]);

  return {
    messages,
    input,
    isLoading,
    setInput,
    sendMessage,
    clearChat,
  };
}
