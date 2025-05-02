import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SendIcon } from "lucide-react";

interface AssistantInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: () => void;
  loading: boolean;
  mentionSuggestions: Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    description?: string;
  }>;
  mentionSearch: string;
  selectedMentionIndex: number;
  setSelectedMentionIndex: (index: number) => void;
  onMentionSelect: (suggestion: any) => void;
}

export function AssistantInput({
  message,
  setMessage,
  onSubmit,
  loading,
  mentionSuggestions,
  mentionSearch,
  selectedMentionIndex,
  setSelectedMentionIndex,
  onMentionSelect
}: AssistantInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Handle new line with shift+enter
    if (e.key === "Enter" && e.shiftKey) {
      // Allow default behavior for new line
      return;
    }
    
    // Handle enter key for form submission (only if mentions are not showing)
    if (e.key === "Enter" && !e.shiftKey && mentionSuggestions.length === 0) {
      e.preventDefault();
      onSubmit();
      return;
    }
    
    // Handle arrow keys for mention selection
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        // Fix: pass a number directly instead of a function
        setSelectedMentionIndex(Math.min(selectedMentionIndex + 1, mentionSuggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        // Fix: pass a number directly instead of a function
        setSelectedMentionIndex(Math.max(0, selectedMentionIndex - 1));
      } else if (e.key === "Escape") {
        e.preventDefault();
        // Clear suggestions
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (mentionSuggestions.length > 0) {
          const selectedMention = mentionSuggestions[selectedMentionIndex];
          onMentionSelect(selectedMention);
        }
      }
    }
  };
  
  return (
    <div className="border-t border-zinc-800 p-4">
      <div className="max-w-3xl mx-auto relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Message AI assistant... (use @ to mention entities)"
          className="min-h-[60px] max-h-[200px] resize-none pr-12 rounded-xl bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-1 focus:ring-purple-700"
          disabled={loading}
        />
        <Button
          size="icon"
          onClick={onSubmit}
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
        
        {mentionSuggestions.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-md shadow-lg z-10">
            <div className="p-1">
              <p className="px-2 py-1 text-xs text-zinc-500">Mentions</p>
              <div className="max-h-48 overflow-y-auto">
                {mentionSuggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.id}`}
                    className={cn(
                      "px-2 py-1.5 hover:bg-zinc-800 cursor-pointer rounded text-sm flex items-center",
                      index === selectedMentionIndex ? "bg-zinc-800" : ""
                    )}
                    onClick={() => onMentionSelect(suggestion)}
                  >
                    <span className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      suggestion.type === 'character' ? "bg-purple-500" :
                      suggestion.type === 'scene' ? "bg-blue-500" :
                      suggestion.type === 'place' ? "bg-green-500" :
                      "bg-amber-500"
                    )}/>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">@{suggestion.type}/{suggestion.name}</span>
                      {suggestion.description && (
                        <span className="text-xs text-zinc-400 truncate max-w-80">
                          {suggestion.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
