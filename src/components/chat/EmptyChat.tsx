
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
        <p className="text-lg text-gray-600">
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
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 bg-gray-50">
      <h2 className="text-xl font-medium text-gray-800 mb-2">
        How can I help with {currentBook.title}?
      </h2>
      <p className="text-gray-600 max-w-md">
        Ask for help with your characters, scenes, or story development.
      </p>
      
      {onPromptClick && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full max-w-md">
          {suggestedPrompts.map((prompt, index) => (
            <div 
              key={index} 
              className="p-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 
                        transition-colors cursor-pointer text-gray-700 text-sm"
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
