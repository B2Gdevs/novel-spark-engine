import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNovel } from "@/contexts/NovelContext";
import { ChatMessage as ChatMessageType } from "@/types/novel";
import { toast } from "sonner";
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';

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
    findEntitiesByPartialName,
    getEntityInfo
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
  }>>([]);
  const [mentionedEntities, setMentionedEntities] = useState<Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    fullText: string;
  }>>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chatHistory]);

  useEffect(() => {
    if (project.currentChatContext) {
      setLinkedEntityType(project.currentChatContext.entityType);
      setLinkedEntityId(project.currentChatContext.entityId);
    } else {
      setLinkedEntityType(null);
      setLinkedEntityId(null);
    }
  }, [project.currentChatContext]);

  // Effect to watch for @ mentions in the message
  useEffect(() => {
    const atIndex = message.lastIndexOf('@');
    
    if (atIndex !== -1 && atIndex < message.length - 1) {
      // Find the part of the message after the last @
      const afterAt = message.substring(atIndex + 1);
      
      // If there's a slash, extract the entity type and search term
      const slashIndex = afterAt.indexOf('/');
      
      if (slashIndex !== -1) {
        const entityType = afterAt.substring(0, slashIndex);
        const searchTerm = afterAt.substring(slashIndex + 1);
        
        // Only search if we have a valid entity type and search term
        if (['character', 'scene', 'place', 'page'].includes(entityType) && searchTerm.length >= 2) {
          const suggestions = findEntitiesByPartialName(
            searchTerm, 
            [entityType as 'character' | 'scene' | 'place' | 'page']
          );
          setMentionSuggestions(suggestions);
          setMentionSearch(searchTerm);
        } else {
          setMentionSuggestions([]);
          setMentionSearch("");
        }
      } else {
        // If no slash yet, show all entity types that match the search
        const searchTerm = afterAt.trim();
        if (searchTerm.length >= 2) {
          const suggestions = findEntitiesByPartialName(
            searchTerm, 
            ['character', 'scene', 'place', 'page']
          );
          setMentionSuggestions(suggestions);
          setMentionSearch(searchTerm);
        } else {
          setMentionSuggestions([]);
          setMentionSearch("");
        }
      }
    } else {
      setMentionSuggestions([]);
      setMentionSearch("");
    }
  }, [message, findEntitiesByPartialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading || !currentBook) return;
    
    setLoading(true);
    
    try {
      // Process the message for @ mentions before sending
      const processedMessage = processMentionsInMessage(message);
      
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
      setMentionedEntities([]);
      
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
          const entityData = getEntityInfo(entity.type, entity.id);
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
  
  // Process message to extract and handle @ mentions
  const processMentionsInMessage = (text: string) => {
    const mentionRegex = /@(character|scene|place|page)\/([^@\s]+)/g;
    const mentions: Array<{
      type: 'character' | 'scene' | 'place' | 'page';
      id: string;
      name: string;
      fullText: string;
    }> = [];
    
    let lastIndex = 0;
    let processedText = '';
    let match: RegExpExecArray | null;
    
    // Reset the regex to start from the beginning
    mentionRegex.lastIndex = 0;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the match
      processedText += text.substring(lastIndex, match.index);
      
      const entityType = match[1] as 'character' | 'scene' | 'place' | 'page';
      const entityName = match[2];
      const fullMatch = match[0]; // The entire @type/name match
      
      // Find the entity in the current book
      const entities = findEntitiesByPartialName(entityName, [entityType]);
      
      if (entities.length > 0) {
        const entity = entities[0]; // Take the first match
        
        // Add this entity to our mentions list
        mentions.push({
          type: entityType,
          id: entity.id,
          name: entity.name,
          fullText: fullMatch
        });
        
        // Replace the @mention with just the name in the processed text
        processedText += entity.name;
      } else {
        // If entity not found, keep the original text
        processedText += fullMatch;
      }
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add any remaining text
    processedText += text.substring(lastIndex);
    
    return {
      messageContent: processedText,
      mentionedEntities: mentions
    };
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
  }) => {
    // Find the last @ in the message
    const atIndex = message.lastIndexOf('@');
    
    if (atIndex !== -1) {
      // Replace from the @ to the current cursor position with the entity mention
      const beforeAt = message.substring(0, atIndex);
      const afterSearch = message.substring(atIndex + mentionSearch.length + 1);
      
      const newMessage = `${beforeAt}@${suggestion.type}/${suggestion.name} ${afterSearch}`;
      
      // Add to mentioned entities
      setMentionedEntities([...mentionedEntities, {
        ...suggestion,
        fullText: `@${suggestion.type}/${suggestion.name}`
      }]);
      
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
      
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {project.chatHistory.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p className="text-lg font-medium mb-2">{`How can I help with "${currentBook.title}"?`}</p>
              <p className="text-sm">Ask me to create characters, scenes, or help with your story.</p>
            </div>
          ) : (
            project.chatHistory.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                currentBook={currentBook}
                onCreateEntity={handleCreateEntity}
                onUpdateEntity={handleUpdateEntity}
                index={index}
              />
            ))
          )}
          <div ref={chatEndRef} />
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-current" />
              <div className="w-2 h-2 rounded-full bg-current animation-delay-200" />
              <div className="w-2 h-2 rounded-full bg-current animation-delay-400" />
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput 
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        loading={loading}
        mentionSearch={mentionSearch}
        mentionSuggestions={mentionSuggestions}
        onMentionSelect={handleMentionSelect}
      />
    </div>
  );
}
