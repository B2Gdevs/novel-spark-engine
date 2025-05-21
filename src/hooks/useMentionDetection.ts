
import { useState, useEffect } from 'react';

// Define the structure of an entity suggestion
export interface EntitySuggestion {
  type: 'character' | 'scene' | 'place' | 'page';
  id: string;
  name: string;
  bookId?: string;
  bookTitle?: string;
}

// Custom hook to detect @mentions in the text input
export function useMentionDetection(
  message: string,
  findEntitiesByPartialName: (partialName: string, type?: string) => any[]
) {
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<EntitySuggestion[]>([]);

  // Detect @mentions in the current message
  useEffect(() => {
    if (!message) {
      setMentionSearch(null);
      setMentionSuggestions([]);
      return;
    }
    
    // Look for @mention patterns
    const lastMention = message.match(/@([^\s/]+)(?:\/([^\s]+))?$/);
    
    if (lastMention) {
      const fullMention = lastMention[0];
      const entityType = fullMention.includes('/') ? fullMention.split('/')[0].substring(1) : null;
      const searchTerm = fullMention.includes('/') ? fullMention.split('/')[1] : fullMention.substring(1);
      
      setMentionSearch(searchTerm);
      
      // Find matching entities
      if (searchTerm && searchTerm.length > 0) {
        const suggestions = findEntitiesByPartialName(searchTerm, entityType || undefined);
        setMentionSuggestions(suggestions);
      } else {
        setMentionSuggestions([]);
      }
    } else {
      setMentionSearch(null);
      setMentionSuggestions([]);
    }
  }, [message, findEntitiesByPartialName]);

  // Replace the @mention with the selected entity
  const handleMentionSelect = (
    message: string, 
    suggestion: EntitySuggestion
  ): string => {
    const lastAtIndex = message.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const beforeMention = message.substring(0, lastAtIndex);
      const afterMention = message.substring(lastAtIndex).match(/\s|$/)?.index || message.length - lastAtIndex;
      const afterText = message.substring(lastAtIndex + afterMention);
      
      // Create the replacement text with the entity reference
      const replacement = `@${suggestion.type}/${suggestion.name} `;
      
      return beforeMention + replacement + afterText;
    }
    
    return message;
  };

  return {
    mentionSearch,
    mentionSuggestions,
    handleMentionSelect
  };
}
