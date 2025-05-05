
import React, { PropsWithChildren } from 'react';
import { CopilotKit, CopilotKitProps } from '@copilotkit/react-core';
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
  
  // Config for the Copilot Kit
  const config: CopilotKitProps = {
    customChatClient: {
      sendMessage: async (message, context) => {
        try {
          // We'll convert the message to a chat API call
          // For now, just echo back the message
          return {
            role: 'assistant',
            content: `This is a placeholder response. In a real implementation, this would process: ${message}`,
          };
        } catch (error) {
          console.error('Error in Copilot Kit:', error);
          return {
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your request.',
          };
        }
      }
    },
    context: contextItems
  };

  return (
    <CopilotKit {...config}>
      {children}
    </CopilotKit>
  );
}
