
import React, { PropsWithChildren } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { useNovel } from '@/contexts/NovelContext';

interface CopilotProviderProps extends PropsWithChildren {}

export function CopilotProvider({ children }: CopilotProviderProps) {
  const { project, currentBook } = useNovel();
  
  // Prepare context for the copilot
  const contextItems = currentBook ? [
    {
      description: `Current book: ${currentBook.title}`,
      content: JSON.stringify({
        id: currentBook.id,
        title: currentBook.title,
        description: currentBook.description,
        genre: currentBook.genre,
        charactersCount: currentBook.characters.length,
        scenesCount: currentBook.scenes.length,
        pagesCount: currentBook.pages.length,
        placesCount: currentBook.places?.length || 0
      })
    }
  ] : [];
  
  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
      context={contextItems}
    >
      {children}
    </CopilotKit>
  );
}
