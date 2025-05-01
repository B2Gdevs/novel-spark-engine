
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Book } from "@/types/novel";

interface ChatHeaderProps {
  currentBook: Book;
  linkedEntityType: string | null;
  linkedEntityId: string | null;
  onClearChat: () => void;
}

export function ChatHeader({ currentBook, linkedEntityType, linkedEntityId, onClearChat }: ChatHeaderProps) {
  return (
    <div className="flex justify-between items-center p-2 border-b border-zinc-800">
      <div className="text-sm text-zinc-400">
        {linkedEntityType && linkedEntityId ? 
          `Chat for ${linkedEntityType}: ${linkedEntityId}` : 
          `General chat for ${currentBook.title}`
        }
      </div>
      
      {!linkedEntityType && !linkedEntityId && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClearChat}
          className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
        >
          <Trash className="h-4 w-4 mr-1" />
          Clear Chat
        </Button>
      )}
    </div>
  );
}
