
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";
import { MessageSquare, SendIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AssistantPage() {
  const { project, currentBook, sendMessageToAI } = useNovel();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;
    
    // Clear input and set loading
    setMessage("");
    setLoading(true);
    
    try {
      // Create system prompt
      const systemInstructions = `
        You are an AI assistant for helping writers develop their novels.
        You are helpful, creative, and supportive. Focus on craft, world building, character development, and plot coherence.
        
        When asked about a specific character, scene, or event, you should give constructive feedback and ideas.
        If a user mentions an entity with @ symbol (like @character/Kael), they are referring to a specific element in their story.
        
        The user currently has:
        - ${currentBook?.characters.length || 0} characters
        - ${currentBook?.scenes.length || 0} scenes
        - ${currentBook?.events.length || 0} events
        - ${currentBook?.notes.length || 0} notes
      `;
      
      await sendMessageToAI(message, project.chatHistory, systemInstructions);
    } catch (error) {
      toast.error("Failed to process request");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-zinc-900 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 p-3 flex justify-end items-center">
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
          <Button 
            variant="outline"
            size="sm"
            className="text-sm text-red-500 hover:text-red-400 hover:bg-zinc-800"
          >
            Clear Chat
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
              <h2 className="text-lg font-medium mb-2 text-white">How can I help with your story?</h2>
              <p className="max-w-md text-sm text-zinc-400">
                Ask for feedback on your characters, plot ideas, or help developing your world.
              </p>
            </div>
            <div className="max-w-md grid grid-cols-2 gap-2 mt-4 text-sm">
              {["Create a new villain character", "Help me develop my protagonist's arc", 
                "Suggest plot twists for my story", "How do I write better dialogue?"].map((prompt, index) => (
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
