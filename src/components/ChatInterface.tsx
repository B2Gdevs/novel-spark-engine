import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNovel } from "@/contexts/NovelContext";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const { project, addChatMessage } = useNovel();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    addChatMessage({
      role: "user",
      content: message
    });
    
    setMessage("");
    setLoading(true);
    
    setTimeout(() => {
      const responses = [
        "I've analyzed your character. Try giving them a more complex motivation that contradicts their stated goals.",
        "Your scene structure is solid. Consider adding a moment where the character reflects on their past choices.",
        "I've noted the connection between your characters. This creates an interesting dynamic for later conflict.",
        "The setting you've created has great potential. What historical events shaped this world?",
        "Consider how your protagonist's flaw directly leads to the central conflict of your story."
      ];
      
      addChatMessage({
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)]
      });
      
      setLoading(false);
    }, 1000);
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
