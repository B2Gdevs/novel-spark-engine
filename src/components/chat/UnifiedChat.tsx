
import React, { useState, useEffect, useRef } from 'react';
import { useNovel } from "@/contexts/NovelContext";
import { ChatMessage as ChatMessageType, Book } from "@/types/novel";
import { toast } from "sonner";
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { processMentionsInMessage } from './MentionUtils';
import { cn } from "@/lib/utils";

interface UnifiedChatProps {
  mode: 'page' | 'dialog';
  onClose?: () => void;
}

export function UnifiedChat({ mode, onClose }: UnifiedChatProps) {
  const { 
    project, 
    addChatMessage, 
    clearChatHistory,
    sendMessageToAI, 
    currentBook,
    associateChatWithEntity,
    getEntityInfo,
    getAllBooks
  } = useNovel();
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkedEntityType, setLinkedEntityType] = useState<string | null>(null);
  const [linkedEntityId, setLinkedEntityId] = useState<string | null>(null);
  
  // For mention functionality
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    description?: string;
    bookId?: string;
    bookTitle?: string;
  }>>([]);

  // Update linked entity state when current chat context changes
  useEffect(() => {
    if (project.currentChatContext) {
      setLinkedEntityType(project.currentChatContext.entityType);
      setLinkedEntityId(project.currentChatContext.entityId);
    } else {
      setLinkedEntityType(null);
      setLinkedEntityId(null);
    }
  }, [project.currentChatContext]);

  // Enhanced effect to watch for @ mentions in the message
  useEffect(() => {
    const atIndex = message.lastIndexOf('@');
    
    if (atIndex !== -1 && atIndex < message.length - 1) {
      // Find the part of the message after the last @
      const afterAt = message.substring(atIndex + 1);
      
      // Check if we've already typed enough to search
      if (afterAt.length >= 1) {
        // We'll need to implement this function or pass it as a prop
        const results = findEntitiesByPartialName(afterAt);
        setMentionSuggestions(results);
        setMentionSearch(afterAt);
      } else {
        setMentionSuggestions([]);
        setMentionSearch("");
      }
    } else {
      setMentionSuggestions([]);
      setMentionSearch("");
    }
  }, [message]);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      
      const currentMessage = message;
      setMessage("");
      
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
            
            if (entityData.bookId && entityData.bookId !== currentBook.id) {
              systemPrompt += ` (from book: ${entityData.bookTitle})`;
            }
          }
        });
        
        systemPrompt += "\n\nUse this entity information to provide context to your response.";
      }
      
      // Send message to AI and wait for response
      const result = await sendMessageToAI(currentMessage, project.chatHistory, systemPrompt);
      
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

  const handleCreateEntity = (entityType: string, entityData: any) => {
    // Will be implemented in a separate component
  };

  const handleUpdateEntity = (entityType: string, entityId: string, entityData: any) => {
    // Will be implemented in a separate component
  };

  const handleClearChat = () => {
    // Only allow clearing if not linked to an entity
    if (!linkedEntityType && !linkedEntityId) {
      clearChatHistory();
    }
  };
  
  const handleMentionSelect = (suggestion: {
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
  }) => {
    // Find the last @ in the message
    const atIndex = message.lastIndexOf('@');
    
    if (atIndex !== -1) {
      // Replace from the @ to the current cursor position with the entity mention
      const beforeAt = message.substring(0, atIndex);
      const afterSearch = message.substring(atIndex + mentionSearch.length + 1);
      
      // Format based on whether cross-book reference is needed
      const mentionText = suggestion.bookId && suggestion.bookId !== currentBook?.id
        ? `@${suggestion.bookTitle}/${suggestion.type}/${suggestion.name} `
        : `@${suggestion.type}/${suggestion.name} `;
      
      const newMessage = `${beforeAt}${mentionText}${afterSearch}`;
      setMessage(newMessage);
    }
  };

  // If no book is selected, don't render the chat interface
  if (!currentBook) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        mode === 'page' ? "h-full" : "h-[300px]"
      )}>
        <p className="text-lg text-zinc-400">
          Please select a book first to use the AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader 
        currentBook={currentBook}
        linkedEntityType={linkedEntityType}
        linkedEntityId={linkedEntityId}
        onClearChat={handleClearChat}
        onClose={mode === 'dialog' ? onClose : undefined}
      />
      
      <ChatMessageList
        messages={project.chatHistory}
        currentBook={currentBook}
        onCreateEntity={handleCreateEntity}
        onUpdateEntity={handleUpdateEntity}
        loading={loading}
      />

      <ChatInput 
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        loading={loading}
        mentionSearch={mentionSearch}
        mentionSuggestions={mentionSuggestions}
        onMentionSelect={handleMentionSelect}
        currentBookId={currentBook.id}
      />
    </div>
  );
}
