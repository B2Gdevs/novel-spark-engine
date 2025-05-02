
import { useState } from 'react';
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";
import { processMentionsInMessage } from "@/components/chat/MentionUtils";
import { Book } from "@/types/novel";
import { generateSystemPrompt } from '@/utils/systemPrompts';

export function useChatSubmission({ 
  linkedEntityType, 
  linkedEntityId, 
  currentBook 
}: { 
  linkedEntityType: string | null, 
  linkedEntityId: string | null, 
  currentBook: Book | null 
}) {
  const { 
    project, 
    addChatMessage, 
    sendMessageToAI,
    getEntityInfo,
    getAllBooks
  } = useNovel();
  
  const [loading, setLoading] = useState(false);
  
  const findEntitiesByPartialName = (partialName: string) => {
    // This is a simplified version
    if (!currentBook) return [];
    
    const results: Array<{
      type: 'character' | 'scene' | 'place' | 'page';
      id: string;
      name: string;
      description?: string;
      bookId?: string;
      bookTitle?: string;
    }> = [];
    
    // Find characters that match the partial name
    currentBook.characters.forEach(char => {
      if (char.name.toLowerCase().includes(partialName.toLowerCase())) {
        results.push({
          type: 'character',
          id: char.id,
          name: char.name,
          description: char.description,
          bookId: currentBook.id,
          bookTitle: currentBook.title
        });
      }
    });
    
    // Find scenes that match the partial name
    currentBook.scenes.forEach(scene => {
      if (scene.title.toLowerCase().includes(partialName.toLowerCase())) {
        results.push({
          type: 'scene',
          id: scene.id,
          name: scene.title,
          description: scene.description,
          bookId: currentBook.id,
          bookTitle: currentBook.title
        });
      }
    });
    
    // Find pages that match the partial name
    currentBook.pages.forEach(page => {
      if (page.title.toLowerCase().includes(partialName.toLowerCase())) {
        results.push({
          type: 'page',
          id: page.id,
          name: page.title,
          description: page.content?.substring(0, 100) + (page.content && page.content.length > 100 ? '...' : ''),
          bookId: currentBook.id,
          bookTitle: currentBook.title
        });
      }
    });
    
    // Find places that match the partial name
    currentBook.places?.forEach(place => {
      if (place.name.toLowerCase().includes(partialName.toLowerCase())) {
        results.push({
          type: 'place',
          id: place.id,
          name: place.name,
          description: place.description,
          bookId: currentBook.id,
          bookTitle: currentBook.title
        });
      }
    });
    
    return results.slice(0, 5);
  };

  const handleSubmit = async (message: string) => {
    if (!message.trim() || loading || !currentBook) return;
    
    setLoading(true);
    
    try {
      // Process the message for @ mentions before sending
      const processedMessage = processMentionsInMessage(
        message, 
        findEntitiesByPartialName, 
        currentBook,
        getAllBooks
      );
      
      // Add user message to chat history with any detected mentions
      addChatMessage({
        role: 'user',
        content: processedMessage.messageContent,
        entityType: linkedEntityType,
        entityId: linkedEntityId,
        mentionedEntities: processedMessage.mentionedEntities.length > 0 
          ? processedMessage.mentionedEntities.map(m => ({
              type: m.type,
              id: m.id,
              name: m.name
            })) 
          : undefined
      });
      
      // Generate system prompt using our utility function
      const systemPrompt = generateSystemPrompt(
        currentBook,
        linkedEntityType,
        linkedEntityId,
        processedMessage.mentionedEntities,
        getEntityInfo
      );
      
      // Send message to AI and wait for response
      const result = await sendMessageToAI(message, project.chatHistory, systemPrompt);
      
      if (!result.success) {
        console.error("Error from AI:", result.error);
        toast.error(`AI error: ${result.error || "Unknown error"}`);
        return;
      }

      // Add AI response to chat
      addChatMessage({
        role: 'assistant',
        content: result.message || "I'm sorry, I couldn't process your request.",
        entityType: linkedEntityType,
        entityId: linkedEntityId
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to communicate with AI");
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    loading,
    findEntitiesByPartialName
  };
}
