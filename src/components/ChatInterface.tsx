
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";

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
        <h2 className="font-semibold">AI Assistant</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {project.chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.role === "user" 
                  ? "bg-primary/10 ml-4" 
                  : "bg-muted mr-4"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  );
}
