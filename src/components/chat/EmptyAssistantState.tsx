
import React from 'react';
import { MessageSquare } from "lucide-react";
import { Book } from "@/types/novel";

interface EmptyAssistantStateProps {
  bookTitle: string;
  onPromptClick: (prompt: string) => void;
}

export function EmptyAssistantState({ bookTitle, onPromptClick }: EmptyAssistantStateProps) {
  const suggestedPrompts = [
    `Create a villainous character for ${bookTitle}`, 
    `Help me develop a protagonist for ${bookTitle}`, 
    `Suggest a plot twist for ${bookTitle}`, 
    `Help me write dialogue for ${bookTitle}`
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-zinc-500">
      <div className="h-12 w-12 bg-zinc-800 flex items-center justify-center rounded-full">
        <MessageSquare className="h-6 w-6 text-zinc-400" />
      </div>
      <div>
        <h2 className="text-lg font-medium mb-2 text-white">How can I help with {bookTitle}?</h2>
        <p className="max-w-md text-sm text-zinc-400">
          Ask for feedback on your characters, plot ideas, or help developing your world.
        </p>
      </div>
      <div className="max-w-md grid grid-cols-2 gap-2 mt-4 text-sm">
        {suggestedPrompts.map((prompt, index) => (
          <div 
            key={index} 
            className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer text-zinc-300"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
}
