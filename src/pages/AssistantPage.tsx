
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNovel } from "@/contexts/NovelContext";
import { processNovelPrompt } from "@/services/openai-service";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";

export function AssistantPage() {
  const { project, addChatMessage, clearChatHistory, apiKey, setApiKey, currentBook } = useNovel();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const characterCount = currentBook?.characters.length || 0;
  const sceneCount = currentBook?.scenes.length || 0;
  const eventCount = currentBook?.events.length || 0;
  const noteCount = currentBook?.notes.length || 0;

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
        - ${characterCount} characters
        - ${sceneCount} scenes
        - ${eventCount} events
        - ${noteCount} notes
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
    <div className="space-y-4 h-[calc(100vh-160px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-novel-purple">AI Assistant</h1>
          <p className="text-muted-foreground">Chat with an AI assistant to help develop your novel</p>
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowApiKeyDialog(true)}
          >
            Configure API Key
          </Button>
          <Button 
            variant="outline" 
            onClick={clearChatHistory}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Clear Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg shadow-inner">
        {project.chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
            <div className="h-20 w-20 bg-novel-purple/10 flex items-center justify-center rounded-full">
              <MessageSquare className="h-10 w-10 text-novel-purple" />
            </div>
            <div>
              <h2 className="text-xl font-medium mb-2">No messages yet</h2>
              <p className="max-w-md">
                Start a conversation with the AI assistant to help develop characters, scenes, and plot points for your novel.
              </p>
            </div>
            <div className="max-w-md mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-2">Try asking:</h3>
              <ul className="space-y-2 text-left">
                <li>• "Create a new character named Kael, a cocky pilot who's secretly working for the enemy."</li>
                <li>• "What would be a good flaw for my protagonist to make them more interesting?"</li>
                <li>• "Suggest a plot twist for the middle of my story."</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {project.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-3xl ${
                    msg.role === "user"
                      ? "bg-novel-purple text-white"
                      : "bg-white"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Badge
                        variant={msg.role === "user" ? "secondary" : "outline"}
                        className={
                          msg.role === "user"
                            ? "bg-white/20 text-white"
                            : "bg-novel-purple/10 text-novel-purple"
                        }
                      >
                        {msg.role === "user" ? "You" : "AI Assistant"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div 
                      className={`prose prose-sm max-w-none ${
                        msg.role === "user" ? "prose-invert" : "prose-custom"
                      }`}
                    >
                      {msg.content.split("\n").map((line, i) => (
                        <p key={i} className="mb-2">
                          {line}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message to the AI assistant..."
          className="flex-1 min-h-[100px] resize-none"
          disabled={loading || !apiKey}
        />
        <Button
          onClick={handleSendMessage}
          className="self-end bg-novel-purple hover:bg-novel-purple/90"
          disabled={loading || !message.trim() || !apiKey}
        >
          {loading ? "Thinking..." : "Send"}
        </Button>
      </div>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure OpenAI API Key</DialogTitle>
            <DialogDescription>
              Enter your OpenAI API key to enable the AI assistant. Your key will be stored locally in your browser.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
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
