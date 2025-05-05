
import { useState, useEffect } from 'react';
import { Book } from '@/types/novel';

interface MentionSuggestion {
  type: 'character' | 'scene' | 'place' | 'page';
  id: string;
  name: string;
  description?: string;
  bookId?: string;
  bookTitle?: string;
}

export function useMentionDetection(
  message: string,
  currentBook: Book | null,
  findEntities: (query: string, entityTypes: Array<'character' | 'scene' | 'place' | 'page'>, includeAllBooks?: boolean) => MentionSuggestion[]
) {
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);

  // Enhanced effect to watch for @ mentions in the message
  useEffect(() => {
    const atIndex = message.lastIndexOf('@');
    
    if (atIndex !== -1 && atIndex < message.length - 1) {
      // Find the part of the message after the last @
      const afterAt = message.substring(atIndex + 1);
      
      // Check if we've already typed enough to search
      if (afterAt.length >= 1) {
        // Search all entity types
        const results = findEntities(afterAt, ['character', 'scene', 'page', 'place']);
        setMentionSuggestions(results);
        setMentionSearch(afterAt);
      } else {
        setMentionSuggestions([]);
        setMentionSearch("");
      }
    } else {
      setMentionSuggestions([]);
      setMentionSearch("");
    }
  }, [message, findEntities]);

  const handleMentionSelect = (
    message: string,
    suggestion: MentionSuggestion,
    currentBookId?: string
  ): string => {
    // Find the last @ in the message
    const atIndex = message.lastIndexOf('@');
    
    if (atIndex !== -1) {
      // Replace from the @ to the current cursor position with the entity mention
      const beforeAt = message.substring(0, atIndex);
      const afterSearch = message.substring(atIndex + mentionSearch.length + 1);
      
      // Format based on whether cross-book reference is needed
      const mentionText = suggestion.bookId && suggestion.bookId !== currentBookId
        ? `@${suggestion.bookTitle}/${suggestion.type}/${suggestion.name} `
        : `@${suggestion.type}/${suggestion.name} `;
      
      return `${beforeAt}${mentionText}${afterSearch}`;
    }
    
    return message;
  };

  return {
    mentionSearch,
    mentionSuggestions,
    handleMentionSelect
  };
}
