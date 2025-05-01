
import React from 'react';
import { BookOpen } from "lucide-react";
import { BookCard } from "@/components/BookCard";

interface WelcomeSectionProps {
  onCreateNew: () => void;
  isLoading: boolean;
}

export function WelcomeSection({ onCreateNew, isLoading }: WelcomeSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <BookOpen className="h-16 w-16 text-purple-400 mb-4" />
      <h1 className="text-3xl font-bold text-white mb-2">Welcome to NovelSpark</h1>
      <p className="text-zinc-400 mb-8 max-w-lg">Start by creating your first book</p>
      
      <div className="w-64">
        <BookCard 
          isNewBookCard 
          onCreateNew={onCreateNew} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
