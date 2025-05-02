
import { useState } from 'react';
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";
import { processMentionsInMessage } from "@/components/chat/MentionUtils";
import { Book } from "@/types/novel";

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
    // Call this from props or context
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
      
      // Create system prompt based on current book context and any linked entity
      let systemPrompt = `
        You are an AI assistant specialized in helping writers develop their novels.
        You're helpful, creative, and supportive. You focus on craft, world building, character development, and plot coherence.
        
        The user is currently working on a book titled "${currentBook.title}" with:
        - ${currentBook.characters.length} characters
        - ${currentBook.scenes.length} scenes
        - ${currentBook.events.length} events
        - ${currentBook.places?.length || 0} places
        - ${currentBook.pages.length} pages
        - ${currentBook.notes.length} notes
        - ${currentBook.summary || 'No summary yet'}
        
        When creating or updating characters, scenes, pages or places, format them as follows:
        
        For characters:
        **Character: [Name]**
        - **Name:** Full name
        - **Traits:** Trait1, Trait2, Trait3
        - **Description:** Physical appearance and notable features
        - **Role:** Character's role in the story
        
        For scenes:
        **Scene: [Title]**
        - **Title:** Scene title
        - **Description:** Brief description of what happens
        - **Location:** Where the scene takes place
        
        For pages:
        **Page: [Title]**
        - **Title:** Page title
        - **Content:** Brief content summary
        
        For places:
        **Place: [Name]**
        - **Name:** Place name
        - **Description:** Brief description
        - **Geography:** Notable geographic features

        Use Markdown formatting in your responses.
      `;
      
      // If we're linked to a specific entity, add more context
      if (linkedEntityType && linkedEntityId) {
        const entityData = getEntityInfo(linkedEntityType, linkedEntityId);
        if (entityData) {
          systemPrompt += `\n\nThis conversation is specifically about the ${linkedEntityType} "${entityData.name || entityData.title}".`;
          
          // Add specific details based on entity type
          switch (linkedEntityType) {
            case 'character':
              systemPrompt += `\nCurrent traits: ${entityData.traits?.join(', ') || 'None'}.
              Current description: ${entityData.description || 'None'}.
              Current role: ${entityData.role || 'None'}.`;
              break;
            case 'scene':
              systemPrompt += `\nCurrent description: ${entityData.description || 'None'}.
              Current location: ${entityData.location || 'None'}.`;
              break;
            case 'page':
              systemPrompt += `\nCurrent content: ${
                entityData.content ? 
                (entityData.content.length > 200 ? entityData.content.substring(0, 200) + '...' : entityData.content) 
                : 'None'
              }.`;
              break;
            case 'place':
              systemPrompt += `\nCurrent description: ${entityData.description || 'None'}.
              Current geography: ${entityData.geography || 'None'}.`;
              break;
          }
        }
      }
      
      // Add context for any mentioned entities in the message
      if (processedMessage.mentionedEntities.length > 0) {
        systemPrompt += "\n\nThe user's message mentions these entities:";
        
        processedMessage.mentionedEntities.forEach(entity => {
          const entityData = getEntityInfo(entity.type, entity.id, entity.bookId);
          if (entityData) {
            systemPrompt += `\n- ${entity.type} "${entityData.name || entityData.title}": `;
            
            switch(entity.type) {
              case 'character':
                systemPrompt += `${entityData.description || 'No description'}, Role: ${entityData.role || 'Unknown'}`;
                break;
              case 'scene':
                systemPrompt += `${entityData.description || 'No description'}, Location: ${entityData.location || 'Unknown'}`;
                break;
              case 'page':
                systemPrompt += entityData.content?.substring(0, 100) || 'No content';
                break;
              case 'place':
                systemPrompt += `${entityData.description || 'No description'}, Geography: ${entityData.geography || 'Unknown'}`;
                break;
            }
            
            if (entity.bookId && entity.bookId !== currentBook.id) {
              systemPrompt += ` (from book: ${entity.bookTitle})`;
            }
          }
        });
        
        systemPrompt += "\n\nUse this entity information to provide context to your response.";
      }
      
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
