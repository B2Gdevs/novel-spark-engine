
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNovel } from "@/contexts/NovelContext";
import { Send, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Character } from "@/types/novel";

export function ChatInterface() {
  const { 
    project, 
    addChatMessage, 
    sendMessageToAI, 
    currentBook,
    addCharacter,
    addScene,
    addPage 
  } = useNovel();
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEntity, setPendingEntity] = useState<{
    type: 'character' | 'scene' | 'page';
    data: any;
  } | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading || !currentBook) return;
    
    setLoading(true);
    
    try {
      // Add user message to chat history
      addChatMessage({
        role: 'user',
        content: message
      });
      
      // Create system prompt based on current book context
      const systemPrompt = `
        You are an AI assistant specialized in helping writers develop their novels.
        You're helpful, creative, and supportive. You focus on craft, world building, character development, and plot coherence.
        
        The user is currently working on a book titled "${currentBook.title}" with:
        - ${currentBook.characters.length} characters
        - ${currentBook.scenes.length} scenes
        - ${currentBook.events.length} events
        - ${currentBook.pages.length} pages
        - ${currentBook.notes.length} notes
        
        When the user wants to create a new character, scene, or page, extract the relevant information 
        and present it in a structured format. Then suggest creating the entity with a confirmation prompt.
        
        For character creation, extract: name, traits, description, role.
        For scene creation, extract: title, description, characters involved, location.
        For page creation, extract: title, content, chapter information.
        
        Don't actually create these entities yourself, just prepare the data and ask for confirmation.
      `;
      
      // Send message to AI
      const currentMessage = message;
      setMessage("");
      
      const result = await sendMessageToAI(currentMessage, project.chatHistory, systemPrompt);
      
      if (!result.success) {
        console.error("Error from AI:", result.error);
        return;
      }
      
      // Process AI response for entity creation
      const response = result.message || "";
      
      // Check if the response contains character creation intent
      if (response.includes("create a character") || response.includes("new character")) {
        const nameMatch = response.match(/name:\s*([^,\n]+)/i);
        const traitsMatch = response.match(/traits:\s*([^,\n]+)/i);
        const roleMatch = response.match(/role:\s*([^,\n]+)/i);
        const descriptionMatch = response.match(/description:\s*([^,\n.]{3,})/i);
        
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
      
      // Similar checks for scenes and pages would go here
      
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmEntityCreation = () => {
    if (!pendingEntity) return;
    
    switch (pendingEntity.type) {
      case 'character':
        addCharacter(pendingEntity.data);
        addChatMessage({
          role: 'assistant',
          content: `I've created the character ${pendingEntity.data.name} for you!`
        });
        break;
      case 'scene':
        addScene(pendingEntity.data);
        addChatMessage({
          role: 'assistant',
          content: `I've created the scene ${pendingEntity.data.title} for you!`
        });
        break;
      case 'page':
        addPage(pendingEntity.data);
        addChatMessage({
          role: 'assistant',
          content: `I've created the page ${pendingEntity.data.title} for you!`
        });
        break;
    }
    
    setPendingEntity(null);
  };

  const cancelEntityCreation = () => {
    addChatMessage({
      role: 'assistant',
      content: `I've discarded the ${pendingEntity?.type} creation. Let me know if you want to try again!`
    });
    setPendingEntity(null);
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
                      : "bg-zinc-800 text-zinc-100"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="absolute -bottom-5 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          {pendingEntity && (
            <div className="flex justify-start gap-4 animate-fade-in-up">
              <div className="bg-amber-900/40 border border-amber-500/30 rounded-2xl px-4 py-3 max-w-[85%]">
                <p className="text-amber-200 font-medium mb-2">
                  {`Ready to create a new ${pendingEntity.type}:`}
                </p>
                {pendingEntity.type === 'character' && (
                  <div className="space-y-1 mb-3">
                    <p><span className="text-amber-400">Name:</span> {pendingEntity.data.name}</p>
                    <p><span className="text-amber-400">Role:</span> {pendingEntity.data.role}</p>
                    <p><span className="text-amber-400">Description:</span> {pendingEntity.data.description}</p>
                    {pendingEntity.data.traits.length > 0 && (
                      <p><span className="text-amber-400">Traits:</span> {pendingEntity.data.traits.join(', ')}</p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white flex gap-1"
                    onClick={confirmEntityCreation}
                  >
                    <Check className="h-4 w-4" />
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500/50 text-amber-300 hover:bg-amber-950/50"
                    onClick={cancelEntityCreation}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
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
