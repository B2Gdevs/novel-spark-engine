import { useState, useEffect } from 'react';
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessageList } from './chat/ChatMessageList';
import { ChatInput } from './chat/ChatInput';
import { useEntitySearch } from "@/contexts/novel/provider/EntitySearchProvider";
import { processMentionsInMessage } from './chat/MentionUtils';

export function ChatInterface() {
  const { 
    project, 
    addChatMessage, 
    clearChatHistory,
    sendMessageToAI, 
    currentBook,
    addCharacter,
    updateCharacter,
    getCharacter,
    addScene,
    updateScene,
    addPage,
    updatePage,
    addPlace,
    updatePlace,
    associateChatWithEntity,
    getEntityInfo,
    getAllBooks
  } = useNovel();
  
  const { searchEntities } = useEntitySearch();
  
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
        const results = searchEntities(afterAt);
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
  }, [message, searchEntities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading || !currentBook) return;
    
    setLoading(true);
    
    try {
      // Process the message for @ mentions before sending
      const processedMessage = processMentionsInMessage(
        message, 
        searchEntities, 
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
        
        When extracting information about characters, scenes, pages or places, format them as follows:
        
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
        if (linkedEntityType === 'character') {
          const character = getCharacter(linkedEntityId);
          if (character) {
            systemPrompt += `\n\nThis conversation is specifically about the character "${character.name}". 
            Current traits: ${character.traits?.join(', ') || 'None'}.
            Current description: ${character.description || 'None'}.
            Current role: ${character.role || 'None'}.`;
          }
        }
        // Similar for other entity types
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
    try {
      let newId: string | undefined;
      
      switch (entityType) {
        case 'character':
          newId = addCharacter(entityData);
          break;
        case 'scene':
          newId = addScene(entityData);
          break;
        case 'page':
          newId = addPage(entityData);
          break;
        case 'place':
          newId = addPlace(entityData);
          break;
      }
      
      if (newId) {
        addChatMessage({
          role: 'system',
          content: `${entityType} ${entityData.name || entityData.title} created successfully!`,
          entityType: entityType,
          entityId: newId
        });
        
        toast.success(`${entityType} created successfully!`);
      }
    } catch (error) {
      console.error(`Error creating ${entityType}:`, error);
      toast.error(`Failed to create ${entityType}`);
    }
  };

  const handleUpdateEntity = (entityType: string, entityId: string, entityData: any) => {
    try {
      switch (entityType) {
        case 'character':
          updateCharacter(entityId, entityData);
          break;
        case 'scene':
          updateScene(entityId, entityData);
          break;
        case 'page':
          updatePage(entityId, entityData);
          break;
        case 'place':
          updatePlace(entityId, entityData);
          break;
      }
      
      addChatMessage({
        role: 'system',
        content: `${entityType} updated successfully!`,
        entityType: entityType,
        entityId: entityId
      });
      
      toast.success(`${entityType} updated successfully!`);
    } catch (error) {
      console.error(`Error updating ${entityType}:`, error);
      toast.error(`Failed to update ${entityType}`);
    }
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
    bookId?: string;
    bookTitle?: string;
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
      <div className="flex flex-col h-full items-center justify-center text-center p-8">
        <p className="text-lg text-zinc-400">
          Please select a book first to use the AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        currentBook={currentBook}
        linkedEntityType={linkedEntityType}
        linkedEntityId={linkedEntityId}
        onClearChat={handleClearChat}
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
