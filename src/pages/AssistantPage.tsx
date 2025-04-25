
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNovel } from "@/contexts/NovelContext";
import { processNovelPrompt } from "@/services/openai-service";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageSquare, SendIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AssistantPage() {
  const { project, addChatMessage, clearChatHistory, apiKey, setApiKey, currentBook } = useNovel();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Show API key dialog if not set
  useEffect(() => {
    if (!apiKey) {
      setShowApiKeyDialog(true);
    }
  }, [apiKey]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Check if API key is set
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    // Add user message to chat
    addChatMessage({ role: "user", content: message });
    
    // Clear input
    setMessage("");
    
    // Process with OpenAI
    setLoading(true);
    try {
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
      
      const response = await processNovelPrompt(message, project, systemInstructions);
      
      if (response.success) {
        addChatMessage({ role: "assistant", content: response.text });
      } else {
        toast.error(`Error: ${response.error || "Failed to get response"}`);
      }
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

  const saveApiKey = () => {
    if (!keyInput.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setApiKey(keyInput.trim());
    setShowApiKeyDialog(false);
    toast.success("API key saved");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-white text-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 p-3 flex justify-between items-center">
        <h1 className="text-xl font-medium">AI Assistant</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowApiKeyDialog(true)}
            className="text-sm"
          >
            API Key
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={clearChatHistory}
            className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {project.chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
            <div className="h-12 w-12 bg-gray-100 flex items-center justify-center rounded-full">
              <MessageSquare className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2">How can I help with your story?</h2>
              <p className="max-w-md text-sm">
                Ask for feedback on your characters, plot ideas, or help developing your world.
              </p>
            </div>
            <div className="max-w-md grid grid-cols-2 gap-2 mt-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                "Create a new villain character"
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                "Help me develop my protagonist's arc"
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                "Suggest plot twists for my story"
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                "How do I write better dialogue?"
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {project.chatHistory.map((msg) => (
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
                      ? "bg-novel-purple text-white rounded-br-none" 
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  )}
                >
                  <div className="prose prose-sm max-w-none">
                    {msg.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className={msg.role === "user" ? "mb-2 text-white" : "mb-2"}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
            {loading && (
              <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-none max-w-[80%] animate-pulse">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animation-delay-200" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animation-delay-400" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message AI assistant..."
            className="min-h-[60px] max-h-[200px] resize-none pr-12 rounded-xl border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            disabled={loading || !apiKey}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={loading || !message.trim() || !apiKey}
            className={cn(
              "absolute right-3 bottom-3 h-8 w-8 rounded-full",
              message.trim() 
                ? "bg-novel-purple hover:bg-novel-purple/90" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            )}
          >
            <SendIcon size={16} className={message.trim() ? "text-white" : "text-gray-500"} />
          </Button>
        </div>
      </div>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure OpenAI API Key</DialogTitle>
            <DialogDescription>
              Enter your OpenAI API key to enable the AI assistant. Your key will be stored locally in your browser.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-novel-purple hover:underline"
              >
                OpenAI's platform
              </a>
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveApiKey} className="bg-novel-purple hover:bg-novel-purple/90">
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Custom Label component for this page
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}
