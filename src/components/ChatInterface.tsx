
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNovel } from "@/contexts/NovelContext";
import { Send, Check, X, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Character, ChatMessage as ChatMessageType } from "@/types/novel";
import { toast } from "sonner";
import { MarkdownMessage } from './chat/MarkdownMessage';

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
    associateChatWithEntity
  } = useNovel();
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkedEntityType, setLinkedEntityType] = useState<string | null>(null);
  const [linkedEntityId, setLinkedEntityId] = useState<string | null>(null);
  const [pendingEntity, setPendingEntity] = useState<{
    type: 'character' | 'scene' | 'page';
    operation: 'create' | 'update';
    data: any;
    originalId?: string;
  } | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading || !currentBook) return;
    
    setLoading(true);
    
    try {
      // Add user message to chat history
      addChatMessage({
        role: 'user',
        content: message,
        entityType: linkedEntityType,
        entityId: linkedEntityId
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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
      <div className="flex justify-between items-center p-2 border-b border-zinc-800">
        <div className="text-sm text-zinc-400">
          {linkedEntityType && linkedEntityId ? 
            `Chat for ${linkedEntityType}: ${linkedEntityId}` : 
            `General chat for ${currentBook.title}`
          }
        </div>
        
        {!linkedEntityType && !linkedEntityId && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearChat}
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          >
            <Trash className="h-4 w-4 mr-1" />
            Clear Chat
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {project.chatHistory.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p className="text-lg font-medium mb-2">{`How can I help with "${currentBook.title}"?`}</p>
              <p className="text-sm">Ask me to create characters, scenes, or help with your story.</p>
            </div>
          ) : (
            project.chatHistory.map((msg, index) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-4 animate-fade-in-up",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'backwards' 
                }}
              >
                <div
                  className={cn(
                    "relative group rounded-2xl px-4 py-3 max-w-[85%] text-sm",
                    msg.role === "user" 
                      ? "bg-purple-600 text-white" 
                      : msg.role === "system"
                        ? "bg-blue-800 text-white"
                        : "bg-zinc-800 text-zinc-100"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <MarkdownMessage 
                      content={msg.content} 
                      onCreateEntity={handleCreateEntity}
                      onUpdateEntity={handleUpdateEntity}
                      currentBook={currentBook}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <span className="absolute -bottom-5 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
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

      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
        <div className="relative max-w-3xl mx-auto">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message AI assistant..."
            className="pr-12 resize-none bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-purple-500"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !message.trim()}
            className="absolute right-2 bottom-2 h-8 w-8 bg-transparent hover:bg-zinc-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
