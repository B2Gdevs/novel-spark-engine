
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Book } from "@/types/novel";

interface AssistantHeaderProps {
  currentBook: Book;
  onSettingsClick: () => void;
}

export function AssistantHeader({ currentBook, onSettingsClick }: AssistantHeaderProps) {
  return (
    <div className="border-b border-zinc-800 p-3 flex justify-between items-center">
      <h2 className="text-lg font-medium">AI Assistant - {currentBook.title}</h2>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={onSettingsClick}
          className="text-sm text-zinc-300 hover:bg-zinc-800"
        >
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Button>
      </div>
    </div>
  );
}
