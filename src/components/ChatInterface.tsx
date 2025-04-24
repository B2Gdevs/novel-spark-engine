
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNovel } from "@/contexts/NovelContext";
import { Send } from "lucide-react";

export function ChatInterface() {
  const { project, addChatMessage } = useNovel();
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    addChatMessage({
      role: "user",
      content: message
    });

    // Here you would integrate with OpenAI
    // For now, just show a simple response
    setTimeout(() => {
      addChatMessage({
        role: "assistant",
        content: "This is a placeholder response. OpenAI integration coming soon!"
      });
    }, 1000);

    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="font-semibold">Novel Assistant</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {project.chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg p-4 max-w-[80%] ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground ml-4" 
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2 items-center">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message Novel Assistant..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
