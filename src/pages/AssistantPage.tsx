
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";
import { MessageSquare, SendIcon, Settings, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function AssistantPage() {
  const { 
    project, 
    currentBook, 
    sendMessageToAI, 
    addChatMessage,
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
  const navigate = useNavigate();

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

  const handleSendMessage = async () => {
    if (!message.trim() || loading || !currentBook) return;
    
    // Clear input and set loading
    setMessage("");
    setLoading(true);
    
    try {
      // Add user message
      addChatMessage({
        role: 'user',
        content: message
      });
      
      // Create system prompt
      const systemInstructions = `
        You are an AI assistant for helping writers develop their novels.
        You are helpful, creative, and supportive. Focus on craft, world building, character development, and plot coherence.
        
        The user is currently working on a book titled "${currentBook.title}" with:
        - ${currentBook.characters.length} characters
        - ${currentBook.scenes.length} scenes
        - ${currentBook.events.length} events
        - ${currentBook.pages.length} pages
        - ${currentBook.notes.length} notes
        
        When the user wants to create a new character, scene, or page, extract the relevant information
        and present it in a structured format. Then suggest creating the entity.
        
        For character creation, extract: name, traits, description, role.
        For scene creation, extract: title, description, characters involved, location.
        For page creation, extract: title, content, chapter information.
      `;
      
      const result = await sendMessageToAI(message, project.chatHistory, systemInstructions);
      
      if (!result.success) return;
      
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
      toast.error("Failed to process request");
      console.error(error);
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
      handleSendMessage();
    }
  };

  // If no book is selected, show a message
  if (!currentBook) {
    return (
      <div className="flex flex-col h-[calc(100vh-56px)] items-center justify-center bg-zinc-900 text-white">
        <p className="text-lg text-zinc-400">
          Please select a book first to use the AI assistant.
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="mt-4 bg-purple-700 hover:bg-purple-800"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-zinc-900 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 p-3 flex justify-between items-center">
        <h2 className="text-lg font-medium">AI Assistant - {currentBook.title}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => toast.success("Chat settings - feature coming soon")}
            className="text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-900">
        {project.chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-zinc-500">
            <div className="h-12 w-12 bg-zinc-800 flex items-center justify-center rounded-full">
              <MessageSquare className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2 text-white">How can I help with {currentBook.title}?</h2>
              <p className="max-w-md text-sm text-zinc-400">
                Ask for feedback on your characters, plot ideas, or help developing your world.
              </p>
            </div>
            <div className="max-w-md grid grid-cols-2 gap-2 mt-4 text-sm">
              {[
                `Create a villainous character for ${currentBook.title}`, 
                `Help me develop a protagonist for ${currentBook.title}`, 
                `Suggest a plot twist for ${currentBook.title}`, 
                `Help me write dialogue for ${currentBook.title}`
              ].map((prompt, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer text-zinc-300"
                  onClick={() => {
                    setMessage(prompt);
                  }}
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {project.chatHistory.map((msg, index) => (
              <div
                key={msg.id}
                className={cn(
                  "flex animate-fade-in-up",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-3 rounded-2xl",
                    msg.role === "user" 
                      ? "bg-purple-800 text-white rounded-br-none" 
                      : "bg-zinc-800 text-zinc-200 rounded-bl-none"
                  )}
                >
                  <div className="prose prose-sm max-w-none">
                    {msg.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className={msg.role === "user" ? "mb-2 text-white" : "mb-2 text-zinc-200"}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {pendingEntity && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="bg-amber-900/40 border border-amber-500/30 rounded-2xl px-4 py-3 max-w-[80%]">
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
      <div className="border-t border-zinc-800 p-4">
        <div className="max-w-3xl mx-auto relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message AI assistant..."
            className="min-h-[60px] max-h-[200px] resize-none pr-12 rounded-xl bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-1 focus:ring-purple-700"
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={loading || !message.trim()}
            className={cn(
              "absolute right-3 bottom-3 h-8 w-8 rounded-full",
              message.trim() 
                ? "bg-purple-800 hover:bg-purple-700" 
                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
            )}
          >
            <SendIcon size={16} className={message.trim() ? "text-white" : "text-zinc-500"} />
          </Button>
        </div>
      </div>
    </div>
  );
}
