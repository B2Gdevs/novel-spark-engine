
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNovel } from "@/contexts/NovelContext";
import { Send, AtSign } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

export function ChatInterface() {
  const { project, currentBook, addChatMessage } = useNovel();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    addChatMessage({
      role: "user",
      content: message
    });
    
    // Clear input
    setMessage("");
    
    // Process with fake response
    setLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I've analyzed your character. Try giving them a more complex motivation that contradicts their stated goals.",
        "Your scene structure is solid. Consider adding a moment where the character reflects on their past choices.",
        `I've noted the connection between ${currentBook?.characters[0]?.name || 'your characters'}. This creates an interesting dynamic for later conflict.`,
        "The setting you've created has great potential. What historical events shaped this world?",
        "Consider how your protagonist's flaw directly leads to the central conflict of your story."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      addChatMessage({
        role: "assistant",
        content: randomResponse
      });
      
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "@") {
      setShowMentions(true);
      setMentionSearch("");
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAtButtonClick = () => {
    setShowMentions(true);
    setMentionSearch("");
    textareaRef.current?.focus();
  };

  const insertMention = (type: string, name: string) => {
    const mention = `@${type}/${name} `;
    setMessage(prev => {
      const beforeAt = prev.substring(0, prev.lastIndexOf('@'));
      return beforeAt + mention;
    });
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  // Filter entities based on search
  const characters = currentBook?.characters || [];
  const scenes = currentBook?.scenes || [];
  const events = currentBook?.events || [];

  const filteredCharacters = mentionSearch 
    ? characters.filter(c => c.name.toLowerCase().includes(mentionSearch.toLowerCase()))
    : characters;
    
  const filteredScenes = mentionSearch 
    ? scenes.filter(s => s.title.toLowerCase().includes(mentionSearch.toLowerCase()))
    : scenes;
    
  const filteredEvents = mentionSearch 
    ? events.filter(e => e.name.toLowerCase().includes(mentionSearch.toLowerCase()))
    : events;

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg border border-zinc-700">
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-6">
          {project.chatHistory.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p className="mb-2 text-lg">Start a conversation with the AI assistant</p>
              <p className="text-sm">Try mentioning characters or scenes using @ symbol</p>
            </div>
          ) : (
            project.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg p-4 max-w-[80%] ${
                    msg.role === "user" 
                      ? "bg-purple-800 text-white" 
                      : "bg-zinc-800 border border-zinc-700 text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t border-zinc-700 p-4 bg-zinc-800">
        <div className="flex gap-2 items-center">
          <Popover open={showMentions} onOpenChange={setShowMentions}>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={handleAtButtonClick}
                className="bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 bg-zinc-800 border border-zinc-700" align="start">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={mentionSearch}
                  onChange={(e) => setMentionSearch(e.target.value)}
                  className="w-full p-2 text-sm bg-zinc-700 border border-zinc-600 rounded text-white"
                />
              </div>
              <div className="max-h-60 overflow-auto">
                {filteredCharacters.length > 0 && (
                  <div className="border-t border-zinc-700">
                    <div className="px-2 py-1 text-xs text-zinc-400 bg-zinc-900">Characters</div>
                    {filteredCharacters.map(char => (
                      <button
                        key={char.id}
                        onClick={() => insertMention('character', char.name)}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-700 text-white text-sm"
                      >
                        {char.name}
                      </button>
                    ))}
                  </div>
                )}
                {filteredScenes.length > 0 && (
                  <div className="border-t border-zinc-700">
                    <div className="px-2 py-1 text-xs text-zinc-400 bg-zinc-900">Scenes</div>
                    {filteredScenes.map(scene => (
                      <button
                        key={scene.id}
                        onClick={() => insertMention('scene', scene.title)}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-700 text-white text-sm"
                      >
                        {scene.title}
                      </button>
                    ))}
                  </div>
                )}
                {filteredEvents.length > 0 && (
                  <div className="border-t border-zinc-700">
                    <div className="px-2 py-1 text-xs text-zinc-400 bg-zinc-900">Events</div>
                    {filteredEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => insertMention('event', event.name)}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-700 text-white text-sm"
                      >
                        {event.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything about your story..."
            className="flex-1 min-h-[80px] resize-none bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
          />
          <Button
            type="submit"
            disabled={loading || !message.trim()}
            className="self-end bg-purple-700 hover:bg-purple-800 text-white"
          >
            {loading ? "Thinking..." : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
