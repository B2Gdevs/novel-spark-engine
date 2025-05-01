
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNovel } from "@/contexts/NovelContext";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const { project, addChatMessage, sendMessageToAI, currentBook } = useNovel();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    
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
        
        When asked about writing topics, you provide constructive feedback and creative ideas.
        When the user references characters or scenes with @ symbols, assist them in developing those elements.
        
        ${currentBook ? `The user is currently working on a book titled "${currentBook.title}" with:
        - ${currentBook.characters.length} characters
        - ${currentBook.scenes.length} scenes
        - ${currentBook.events.length} events
        - ${currentBook.notes.length} notes` : 'The user has not selected a specific book to work on yet.'}
      `;
      
      // Send message to AI
      const currentMessage = message;
      setMessage("");
      
      const result = await sendMessageToAI(currentMessage, project.chatHistory, systemPrompt);
      
      if (!result.success) {
        console.error("Error from AI:", result.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {project.chatHistory.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p className="text-lg font-medium mb-2">How can I help you with your story?</p>
              <p className="text-sm">Ask me anything about your characters, scenes, or plot.</p>
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
