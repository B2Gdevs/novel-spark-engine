
import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";

interface ChatMentionProps {
  mention: {
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    bookId?: string;
    bookTitle?: string;
  };
  onRemove?: (mention: {
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    bookId?: string;
    bookTitle?: string;
  }) => void;
  showRemove?: boolean;
  currentBookId?: string;
}

export function ChatMention({ mention, onRemove, showRemove = true, currentBookId }: ChatMentionProps) {
  const getTypeColor = () => {
    switch(mention.type) {
      case 'character': return "bg-purple-900/50 text-purple-200 hover:bg-purple-800";
      case 'scene': return "bg-blue-900/50 text-blue-200 hover:bg-blue-800";
      case 'place': return "bg-green-900/50 text-green-200 hover:bg-green-800";
      case 'page': return "bg-amber-900/50 text-amber-200 hover:bg-amber-800";
      default: return "bg-zinc-800 text-zinc-200 hover:bg-zinc-700";
    }
  };

  const getDisplayText = () => {
    if (mention.bookId && mention.bookId !== currentBookId && mention.bookTitle) {
      return `${mention.name} (${mention.bookTitle})`;
    }
    return mention.name;
  };

  return (
    <Badge 
      className={cn(
        "px-2 py-0.5 flex items-center space-x-1 gap-1",
        getTypeColor()
      )}
    >
      <span>{getDisplayText()}</span>
      {showRemove && onRemove && (
        <button 
          type="button"
          onClick={() => onRemove(mention)}
          className="hover:text-white rounded-full"
          aria-label={`Remove ${mention.name} mention`}
        >
          <X size={12} />
        </button>
      )}
    </Badge>
  );
}
