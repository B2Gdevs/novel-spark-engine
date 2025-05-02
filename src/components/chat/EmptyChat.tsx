
import React from 'react';
import { Book } from '@/types/novel';
import { cn } from '@/lib/utils';

interface EmptyChatProps {
  currentBook: Book | null;
  mode: 'page' | 'dialog';
  onPromptClick?: (prompt: string) => void;
}

export function EmptyChat({ currentBook, mode, onPromptClick }: EmptyChatProps) {
  if (!currentBook) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        mode === 'page' ? "h-full" : "h-[300px]"
      )}>
        <p className="text-lg text-zinc-400">
          Please select a book first to use the AI assistant.
        </p>
      </div>
    );
  }
  
  const suggestedPrompts = [
    `Create a villainous character for ${currentBook.title}`, 
    `Help me develop a protagonist for ${currentBook.title}`, 
    `Suggest a plot twist for ${currentBook.title}`, 
    `Help me write dialogue for ${currentBook.title}`
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
      <h2 className="text-xl font-medium text-white mb-2">
        How can I help with {currentBook.title}?
      </h2>
      <p className="text-zinc-400 max-w-md">
        Ask for help with your characters, scenes, or story development.
      </p>
      
      {onPromptClick && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full max-w-md">
          {suggestedPrompts.map((prompt, index) => (
            <div 
              key={index} 
              className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700 
                        transition-colors cursor-pointer text-zinc-300 text-sm"
              onClick={() => onPromptClick(prompt)}
            >
              {prompt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
