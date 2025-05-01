
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MentionSuggestion {
  type: 'character' | 'scene' | 'place' | 'page';
  id: string;
  name: string;
  description?: string;
}

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  mentionSearch: string;
  mentionSuggestions: MentionSuggestion[];
  onMentionSelect: (suggestion: MentionSuggestion) => void;
}

export function ChatInput({ 
  message, 
  setMessage, 
  onSubmit, 
  loading,
  mentionSearch,
  mentionSuggestions,
  onMentionSelect
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Show mentions popover when @ is typed and there's a search term
  useEffect(() => {
    if (mentionSearch && mentionSearch.length >= 2) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }, [mentionSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Handle enter key for form submission
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
    
    // Handle arrow keys for mention selection
    if (showMentions && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Escape" || e.key === "Enter")) {
      // Prevent default for these keys when mentions are shown
      if (e.key !== "Enter" || (e.key === "Enter" && showMentions)) {
        e.preventDefault();
      }
      
      // Exit mention mode on escape
      if (e.key === "Escape") {
        setShowMentions(false);
      }
    }
  };
  
  const handleMentionSelect = (suggestion: MentionSuggestion) => {
    onMentionSelect(suggestion);
    setShowMentions(false);
    
    // Focus back on textarea after selection
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-zinc-800">
      <div ref={inputRef} className="relative max-w-3xl mx-auto">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Message AI assistant... (use @ to mention entities)"
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
        
        {showMentions && mentionSuggestions.length > 0 && (
          <div 
            ref={popoverRef}
            className="absolute bottom-full left-0 mb-1 w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-md shadow-lg z-10"
          >
            <div className="p-1">
              <p className="px-2 py-1 text-xs text-zinc-500">Mentions</p>
              <div className="max-h-48 overflow-y-auto">
                {mentionSuggestions.map((suggestion) => (
                  <div
                    key={`${suggestion.type}-${suggestion.id}`}
                    className="px-2 py-1.5 hover:bg-zinc-800 cursor-pointer rounded text-sm flex items-center"
                    onClick={() => handleMentionSelect(suggestion)}
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
    </form>
  );
}
