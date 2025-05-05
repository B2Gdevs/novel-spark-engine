
import React, { PropsWithChildren } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { useNovel } from '@/contexts/NovelContext';

interface CopilotProviderProps extends PropsWithChildren {}

export function CopilotProvider({ children }: CopilotProviderProps) {
  const { project, currentBook } = useNovel();
  
  // Prepare information about current book for the copilot
  const bookInfo = currentBook ? {
    id: currentBook.id,
    title: currentBook.title,
    description: currentBook.description,
    genre: currentBook.genre,
    charactersCount: currentBook.characters.length,
    scenesCount: currentBook.scenes.length,
    pagesCount: currentBook.pages.length,
    placesCount: currentBook.places?.length || 0
  } : null;
  
  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
      // Use documents prop instead of context
      documents={bookInfo ? [
        {
          name: `Current book: ${currentBook.title}`,
          content: JSON.stringify(bookInfo)
        }
      ] : []}
    >
      {children}
    </CopilotKit>
  );
}
