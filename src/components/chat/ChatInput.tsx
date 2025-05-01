
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, AtSign, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MentionPopover } from './MentionPopover';
import { Badge } from "@/components/ui/badge";

interface MentionSuggestion {
  type: 'character' | 'scene' | 'place' | 'page';
  id: string;
  name: string;
  description?: string;
  bookId?: string;
  bookTitle?: string;
}

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  mentionSearch: string;
  mentionSuggestions: MentionSuggestion[];
  onMentionSelect: (suggestion: MentionSuggestion) => void;
  currentBookId?: string;
}

export function ChatInput({ 
  message, 
  setMessage, 
  onSubmit, 
  loading,
  mentionSearch,
  mentionSuggestions,
  onMentionSelect,
  currentBookId
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  
  // Active mentions that have been inserted
  const [activeMentions, setActiveMentions] = useState<MentionSuggestion[]>([]);
  
  // Show mentions popover when @ is typed and there's a search term
  useEffect(() => {
    if (mentionSearch && mentionSearch.length >= 1) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }, [mentionSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Handle new line with shift+enter
    if (e.key === "Enter" && e.shiftKey) {
      // Allow default behavior for new line
      return;
    }
    
    // Handle enter key for form submission (only if mentions are not showing)
    if (e.key === "Enter" && !e.shiftKey && !showMentions) {
      e.preventDefault();
      onSubmit(e);
      return;
    }
    
    // Handle @ key for showing entity selector
    if (e.key === "@") {
      // No need to prevent default as we want the @ to appear
    }
    
    // Handle arrow keys for mention selection
    if (showMentions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < mentionSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowMentions(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (mentionSuggestions.length > 0) {
          const selectedMention = mentionSuggestions[selectedMentionIndex];
          handleMentionSelect(selectedMention);
        }
      }
    }
  };
  
  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedMentionIndex(0);
  }, [mentionSuggestions]);
  
  const handleMentionSelect = (suggestion: MentionSuggestion) => {
    onMentionSelect(suggestion);
    setShowMentions(false);
    
    // Add to active mentions if not already there
    if (!activeMentions.find(m => m.id === suggestion.id && m.type === suggestion.type)) {
      setActiveMentions([...activeMentions, suggestion]);
    }
    
    // Focus back on textarea after selection
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };
  
  const handleMentionViaPopover = (suggestion: MentionSuggestion) => {
    // Format based on whether there's a book reference needed
    const mentionText = suggestion.bookId && suggestion.bookId !== currentBookId
      ? `@${suggestion.bookTitle}/${suggestion.type}/${suggestion.name} `
      : `@${suggestion.type}/${suggestion.name} `;
    
    // Insert at cursor position
    const textarea = textareaRef.current;
    if (textarea) {
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      const textBefore = message.substring(0, startPos);
      const textAfter = message.substring(endPos);
      
      setMessage(textBefore + mentionText + textAfter);
      
      // Add to active mentions
      if (!activeMentions.find(m => m.id === suggestion.id && m.type === suggestion.type)) {
        setActiveMentions([...activeMentions, suggestion]);
      }
      
      // Focus and set cursor position after the inserted text
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = startPos + mentionText.length;
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
      }, 0);
    }
  };

  const removeMention = (mentionToRemove: MentionSuggestion) => {
    // Remove from active mentions
    setActiveMentions(activeMentions.filter(m => 
      !(m.id === mentionToRemove.id && m.type === mentionToRemove.type)
    ));
    
    // Remove from message text
    const formattedMention1 = `@${mentionToRemove.type}/${mentionToRemove.name}`;
    const formattedMention2 = mentionToRemove.bookId && mentionToRemove.bookId !== currentBookId
      ? `@${mentionToRemove.bookTitle}/${mentionToRemove.type}/${mentionToRemove.name}`
      : formattedMention1;
    
    // Try both formats to make sure we remove it
    let newMessage = message;
    [formattedMention1, formattedMention2].forEach(mention => {
      newMessage = newMessage.replace(new RegExp(mention + '\\s?', 'g'), '');
    });
    
    setMessage(newMessage);
  };

  // Highlight @mentions in the textarea
  const highlightMentions = () => {
    if (!activeMentions.length) return message;
    
    // No direct way to highlight text in a textarea, but we can
    // show the message is using mentions by adding visual indicators
    return message;
  };

  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-zinc-800">
      <div 
        ref={inputRef} 
        className="relative max-w-3xl mx-auto"
        data-current-book-id={currentBookId}
      >
        <div className="flex flex-wrap items-center mb-1 space-x-1">
          <MentionPopover 
            onSelectMention={handleMentionViaPopover}
            currentBookId={currentBookId} 
          />
          
          {activeMentions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {activeMentions.map((mention) => (
                <Badge 
                  key={`${mention.type}-${mention.id}`}
                  className={cn(
                    "px-2 py-0.5 flex items-center space-x-1 gap-1",
                    mention.type === 'character' ? "bg-purple-900/50 text-purple-200 hover:bg-purple-800" :
                    mention.type === 'scene' ? "bg-blue-900/50 text-blue-200 hover:bg-blue-800" :
                    mention.type === 'place' ? "bg-green-900/50 text-green-200 hover:bg-green-800" :
                    "bg-amber-900/50 text-amber-200 hover:bg-amber-800"
                  )}
                >
                  <span>{mention.name}</span>
                  <button 
                    type="button"
                    onClick={() => removeMention(mention)}
                    className="hover:text-white rounded-full"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              {activeMentions.length > 3 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-zinc-800 text-xs px-2 py-0.5 rounded-full">
                      +{activeMentions.length - 3} more
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      {activeMentions.slice(3).map((mention, i) => (
                        <div key={i}>{mention.name} ({mention.type})</div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
        
        <Textarea
          ref={textareaRef}
          value={highlightMentions()}
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
                {mentionSuggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.id}`}
                    className={cn(
                      "px-2 py-1.5 hover:bg-zinc-800 cursor-pointer rounded text-sm flex items-center",
                      index === selectedMentionIndex ? "bg-zinc-800" : ""
                    )}
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
                      <span className="font-medium text-white">
                        {suggestion.bookTitle && suggestion.bookId !== currentBookId 
                          ? `@${suggestion.bookTitle}/${suggestion.type}/${suggestion.name}`
                          : `@${suggestion.type}/${suggestion.name}`
                        }
                      </span>
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
