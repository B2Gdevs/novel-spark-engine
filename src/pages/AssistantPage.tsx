import { useState, useEffect, useRef } from "react";
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AssistantHeader } from "@/components/chat/AssistantHeader";
import { EmptyAssistantState } from "@/components/chat/EmptyAssistantState";
import { AssistantMessageItem } from "@/components/chat/AssistantMessageItem";
import { EntityConfirmationCard } from "@/components/chat/EntityConfirmationCard";
import { AssistantInput } from "@/components/chat/AssistantInput";

export function AssistantPage() {
  const { 
    project, 
    currentBook, 
    sendMessageToAI, 
    addChatMessage,
    addCharacter,
    addScene,
    addPage,
    addPlace,
    findEntitiesByPartialName,
    getEntityInfo
  } = useNovel();
  
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEntity, setPendingEntity] = useState<{
    type: 'character' | 'scene' | 'page' | 'place';
    data: any;
  } | null>(null);
  
  // For mention functionality
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    description?: string;
  }>>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  // Redirect if no book is selected
  useEffect(() => {
    if (!currentBook) {
      toast.warning("Please select a book first to use the AI assistant");
      navigate("/");
    }
  }, [currentBook, navigate]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chatHistory]);
  
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
        if (['character', 'scene', 'place', 'page'].includes(entityType) && searchTerm.length >= 1) {
          const suggestions = findEntitiesByPartialName(
            searchTerm, 
            [entityType as 'character' | 'scene' | 'place' | 'page']
          );
          setMentionSuggestions(suggestions);
          setMentionSearch(searchTerm);
          setSelectedMentionIndex(0);
        } else {
          setMentionSuggestions([]);
          setMentionSearch("");
        }
      } else {
        // If no slash yet, show all entity types that match the search
        const searchTerm = afterAt.trim();
        if (searchTerm.length >= 1) {
          const suggestions = findEntitiesByPartialName(
            searchTerm, 
            ['character', 'scene', 'place', 'page']
          );
          setMentionSuggestions(suggestions);
          setMentionSearch(searchTerm);
          setSelectedMentionIndex(0);
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
      setMessage(newMessage);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || loading || !currentBook) return;
    
    // Process the message for @ mentions before sending
    const processedMessage = processMentionsInMessage(message);
    
    // Clear input and set loading
    setMessage("");
    setLoading(true);
    
    try {
      // Add user message
      addChatMessage({
        role: 'user',
        content: processedMessage.messageContent,
        mentionedEntities: processedMessage.mentionedEntities.length > 0 
          ? processedMessage.mentionedEntities.map(m => ({
              type: m.type,
              id: m.id,
              name: m.name
            })) 
          : undefined
      });
      
      // Create system prompt
      let systemInstructions = `
        You are an AI assistant for helping writers develop their novels.
        You are helpful, creative, and supportive. Focus on craft, world building, character development, and plot coherence.
        
        The user is currently working on a book titled "${currentBook.title}" with:
        - ${currentBook.characters.length} characters
        - ${currentBook.scenes.length} scenes
        - ${currentBook.events.length} events
        - ${currentBook.places?.length || 0} places
        - ${currentBook.pages.length} pages
        - ${currentBook.notes.length} notes
        - ${currentBook.summary || 'No summary yet'}
        
        When the user wants to create a new character, scene, place, or page, extract the relevant information
        and present it in a structured format. Then suggest creating the entity.
        
        For character creation, format as:
        **Character: [Name]**
        - **Name:** Full name
        - **Traits:** Trait1, Trait2, Trait3
        - **Description:** Physical appearance and notable features
        - **Role:** Character's role in the story
        
        For scene creation, format as:
        **Scene: [Title]**
        - **Title:** Scene title
        - **Description:** Brief description of what happens
        - **Location:** Where the scene takes place
        
        For page creation, format as:
        **Page: [Title]**
        - **Title:** Page title
        - **Content:** Brief content summary
        
        For place creation, format as:
        **Place: [Name]**
        - **Name:** Place name
        - **Description:** Brief description of the location
        - **Geography:** Notable geographic features
      `;
      
      // Add context for any mentioned entities in the message
      if (processedMessage.mentionedEntities.length > 0) {
        systemInstructions += "\n\nThe user's message mentions these entities:";
        
        processedMessage.mentionedEntities.forEach(entity => {
          const entityData = getEntityInfo(entity.type, entity.id);
          if (entityData) {
            systemInstructions += `\n- ${entity.type} "${entityData.name || entityData.title}": `;
            
            switch(entity.type) {
              case 'character':
                systemInstructions += `${entityData.description || 'No description'}, Role: ${entityData.role || 'Unknown'}`;
                break;
              case 'scene':
                systemInstructions += `${entityData.description || 'No description'}, Location: ${entityData.location || 'Unknown'}`;
                break;
              case 'page':
                systemInstructions += entityData.content?.substring(0, 100) || 'No content';
                break;
              case 'place':
                systemInstructions += `${entityData.description || 'No description'}, Geography: ${entityData.geography || 'Unknown'}`;
                break;
            }
          }
        });
        
        systemInstructions += "\n\nUse this entity information to provide context to your response.";
      }
      
      sendMessageToAI(processedMessage.messageContent, project.chatHistory, systemInstructions)
        .then(result => {
          if (!result.success) return;
          
          // Process AI response for entity creation
          const response = result.message || "";
          
          // Add AI response to the chat
          addChatMessage({
            role: 'assistant',
            content: response
          });
          
          // Extract entity creation info if present
          if (response.includes("**Character:")) {
            const nameMatch = response.match(/\*\*Name:\*\*\s*([^\n]+)/i);
            const traitsMatch = response.match(/\*\*Traits:\*\*\s*([^\n]+)/i);
            const roleMatch = response.match(/\*\*Role:\*\*\s*([^\n]+)/i);
            const descriptionMatch = response.match(/\*\*Description:\*\*\s*([^\n.]{3,})/i);
            
            if (nameMatch) {
              const characterData = {
                name: nameMatch[1].trim(),
                traits: traitsMatch ? traitsMatch[1].trim().split(/\s*,\s*/) : [],
                role: roleMatch ? roleMatch[1].trim() : "",
                description: descriptionMatch ? descriptionMatch[1].trim() : "",
              };
              
              // Set pending entity for confirmation
              setPendingEntity({
                type: 'character',
                data: characterData
              });
            }
          }
          
          // Check if the response contains scene creation intent
          else if (response.includes("**Scene:")) {
            const titleMatch = response.match(/\*\*Title:\*\*\s*([^\n]+)/i);
            const descriptionMatch = response.match(/\*\*Description:\*\*\s*([^\n]+)/i);
            const locationMatch = response.match(/\*\*Location:\*\*\s*([^\n]+)/i);
            
            if (titleMatch) {
              const sceneData = {
                title: titleMatch[1].trim(),
                description: descriptionMatch ? descriptionMatch[1].trim() : "",
                location: locationMatch ? locationMatch[1].trim() : "",
                characters: [],
                content: ""
              };
              
              setPendingEntity({
                type: 'scene',
                data: sceneData
              });
            }
          }
          
          // Check if the response contains page creation intent
          else if (response.includes("**Page:")) {
            const titleMatch = response.match(/\*\*Title:\*\*\s*([^\n]+)/i);
            const contentMatch = response.match(/\*\*Content:\*\*\s*([^\n]+)/i);
            
            if (titleMatch) {
              const pageData = {
                title: titleMatch[1].trim(),
                content: contentMatch ? contentMatch[1].trim() : "",
                order: currentBook.pages.length
              };
              
              setPendingEntity({
                type: 'page',
                data: pageData
              });
            }
          }
          
          // Check if the response contains place creation intent
          else if (response.includes("**Place:")) {
            const nameMatch = response.match(/\*\*Name:\*\*\s*([^\n]+)/i);
            const descriptionMatch = response.match(/\*\*Description:\*\*\s*([^\n]+)/i);
            const geographyMatch = response.match(/\*\*Geography:\*\*\s*([^\n]+)/i);
            
            if (nameMatch) {
              const placeData = {
                name: nameMatch[1].trim(),
                description: descriptionMatch ? descriptionMatch[1].trim() : "",
                geography: geographyMatch ? geographyMatch[1].trim() : ""
              };
              
              setPendingEntity({
                type: 'place',
                data: placeData
              });
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      toast.error("Failed to process request");
      console.error(error);
      setLoading(false);
    }
  };

  const confirmEntityCreation = () => {
    if (!pendingEntity) return;
    
    try {
      switch (pendingEntity.type) {
        case 'character':
          addCharacter(pendingEntity.data);
          addChatMessage({
            role: 'system',
            content: `I've created the character ${pendingEntity.data.name} for you!`
          });
          break;
        case 'scene':
          addScene(pendingEntity.data);
          addChatMessage({
            role: 'system',
            content: `I've created the scene ${pendingEntity.data.title} for you!`
          });
          break;
        case 'page':
          addPage(pendingEntity.data);
          addChatMessage({
            role: 'system',
            content: `I've created the page ${pendingEntity.data.title} for you!`
          });
          break;
        case 'place':
          addPlace(pendingEntity.data);
          addChatMessage({
            role: 'system',
            content: `I've created the place ${pendingEntity.data.name} for you!`
          });
          break;
      }
      
      toast.success(`${pendingEntity.type} created successfully!`);
      setPendingEntity(null);
    } catch (error) {
      console.error(`Error creating ${pendingEntity.type}:`, error);
      toast.error(`Failed to create ${pendingEntity.type}`);
    }
  };

  const cancelEntityCreation = () => {
    if (!pendingEntity) return;
    
    addChatMessage({
      role: 'system',
      content: `I've discarded the ${pendingEntity.type} creation. Let me know if you want to try again!`
    });
    setPendingEntity(null);
  };
  
  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  // If no book is selected, show a message
  if (!currentBook) {
    return (
      <div className="flex flex-col h-[calc(100vh-56px)] items-center justify-center bg-zinc-900 text-white">
        <p className="text-lg text-zinc-400">
          Please select a book first to use the AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-zinc-900 text-white">
      {/* Header */}
      <AssistantHeader
        currentBook={currentBook}
        onSettingsClick={() => toast.success("Chat settings - feature coming soon")}
      />

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-900">
        {project.chatHistory.length === 0 ? (
          <EmptyAssistantState
            bookTitle={currentBook.title}
            onPromptClick={handlePromptClick}
          />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {project.chatHistory.map((msg) => (
              <AssistantMessageItem key={msg.id} message={msg} />
            ))}
            
            {pendingEntity && (
              <EntityConfirmationCard
                entityType={pendingEntity.type}
                entityData={pendingEntity.data}
                onConfirm={confirmEntityCreation}
                onCancel={cancelEntityCreation}
              />
            )}
            
            <div ref={chatEndRef} />
            {loading && (
              <div className="flex items-center gap-1 px-4 py-3 bg-zinc-800 rounded-2xl rounded-bl-none max-w-[80%] animate-pulse">
                <div className="w-2 h-2 rounded-full bg-zinc-600" />
                <div className="w-2 h-2 rounded-full bg-zinc-600 animation-delay-200" />
                <div className="w-2 h-2 rounded-full bg-zinc-600 animation-delay-400" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <AssistantInput 
        message={message}
        setMessage={setMessage}
        onSubmit={handleSendMessage}
        loading={loading}
        mentionSuggestions={mentionSuggestions}
        mentionSearch={mentionSearch}
        selectedMentionIndex={selectedMentionIndex}
        setSelectedMentionIndex={setSelectedMentionIndex}
        onMentionSelect={handleMentionSelect}
      />
    </div>
  );
}
