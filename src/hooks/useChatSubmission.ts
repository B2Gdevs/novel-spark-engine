
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

// Interface for linked entity context
interface ChatSubmissionProps {
  linkedEntityType?: string;
  linkedEntityId?: string;
  currentBook?: any;
}

// Custom hook for handling chat submissions and managing chat state
export function useChatSubmission(props?: ChatSubmissionProps) {
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
          linkedEntityType: props?.linkedEntityType,
          linkedEntityId: props?.linkedEntityId
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
  
  // Function to handle submitting a message (wrapper for sendMessage)
  const handleSubmit = async (message: string) => {
    setInput(message);
    await sendMessage();
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

  // Helper function to find entities by partial name (for mention suggestions)
  const findEntitiesByPartialName = (partialName: string, type?: string) => {
    if (!currentBook) return [];
    
    const results: any[] = [];
    
    // Filter characters
    if (!type || type === 'character') {
      const matchedCharacters = currentBook.characters?.filter((char: any) => 
        char.name.toLowerCase().includes(partialName.toLowerCase())
      ).map((char: any) => ({
        type: 'character',
        id: char.id,
        name: char.name,
        bookId: currentBook.id,
        bookTitle: currentBook.title
      })) || [];
      
      results.push(...matchedCharacters);
    }
    
    // Filter scenes
    if (!type || type === 'scene') {
      const matchedScenes = currentBook.scenes?.filter((scene: any) => 
        scene.title.toLowerCase().includes(partialName.toLowerCase())
      ).map((scene: any) => ({
        type: 'scene',
        id: scene.id,
        name: scene.title,
        bookId: currentBook.id,
        bookTitle: currentBook.title
      })) || [];
      
      results.push(...matchedScenes);
    }
    
    // Filter places
    if (!type || type === 'place') {
      const matchedPlaces = currentBook.places?.filter((place: any) => 
        place.name.toLowerCase().includes(partialName.toLowerCase())
      ).map((place: any) => ({
        type: 'place',
        id: place.id,
        name: place.name,
        bookId: currentBook.id,
        bookTitle: currentBook.title
      })) || [];
      
      results.push(...matchedPlaces);
    }
    
    // Filter pages
    if (!type || type === 'page') {
      const matchedPages = currentBook.pages?.filter((page: any) => 
        page.title.toLowerCase().includes(partialName.toLowerCase())
      ).map((page: any) => ({
        type: 'page',
        id: page.id,
        name: page.title,
        bookId: currentBook.id,
        bookTitle: currentBook.title
      })) || [];
      
      results.push(...matchedPages);
    }
    
    return results.slice(0, 5); // Limit to 5 results
  };

  // Effect to prepend referenced entities to the chat messages
  useEffect(() => {
    if (detectedEntities && detectedEntities.length > 0) {
      const entityMessages = processReferencedEntities();
      setMessages(prev => [...entityMessages, ...prev]);
      setDetectedEntities(null); // Clear detected entities after processing
    }
  }, [detectedEntities]);

  return {
    messages,
    input,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    setInput,
    sendMessage,
    handleSubmit,
    findEntitiesByPartialName,
    clearChat,
  };
}
