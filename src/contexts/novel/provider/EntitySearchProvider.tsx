
import React, { createContext, useContext, useState } from 'react';
import { Book } from "@/types/novel";

interface EntitySearchContextType {
  searchEntities: (
    query: string,
    types?: Array<'character' | 'scene' | 'place' | 'page'>
  ) => Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    description?: string;
    bookId?: string;
    bookTitle?: string;
  }>;
  getEntityInfo: (entityType: string, entityId: string, bookId?: string) => any;
  showMentionDialog: boolean;
  setShowMentionDialog: (show: boolean) => void;
  mentionQuery: string;
  setMentionQuery: (query: string) => void;
}

const EntitySearchContext = createContext<EntitySearchContextType | undefined>(undefined);

interface EntitySearchProviderProps {
  currentBook: Book | null;
  children: React.ReactNode;
  findEntitiesByPartialName: (
    partialName: string,
    entityTypes: Array<'character' | 'scene' | 'place' | 'page'>,
    includeAllBooks?: boolean
  ) => Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    description?: string;
    bookId?: string;
    bookTitle?: string;
  }>;
  getEntityInfo: (entityType: string, entityId: string, bookId?: string) => any;
}

// Simple fuzzy search function that gives higher scores to matches at start of string
function fuzzyMatch(str: string, pattern: string): number {
  const strLower = str.toLowerCase();
  const patternLower = pattern.toLowerCase();
  
  // Direct match at beginning gets highest score
  if (strLower.startsWith(patternLower)) {
    return 1000;
  }
  
  // Word boundary match gets high score
  if (new RegExp(`\\b${patternLower}`, 'i').test(strLower)) {
    return 500;
  }
  
  // Contains match gets medium score
  const idx = strLower.indexOf(patternLower);
  if (idx >= 0) {
    return 100 - idx; // Higher score for earlier matches
  }
  
  // No direct match, check for partial character matches
  let score = 0;
  let matchCount = 0;
  let lastMatchIndex = -1;
  
  for (let i = 0; i < patternLower.length; i++) {
    const c = patternLower[i];
    const idx = strLower.indexOf(c, lastMatchIndex + 1);
    if (idx >= 0) {
      matchCount++;
      // Consecutive matches are better
      if (lastMatchIndex + 1 === idx) {
        score += 10;
      } else {
        score += 1;
      }
      lastMatchIndex = idx;
    }
  }
  
  // Require at least 60% of characters to match
  if (matchCount < patternLower.length * 0.6) {
    return 0;
  }
  
  return score;
}

export function EntitySearchProvider({ 
  currentBook, 
  children,
  findEntitiesByPartialName,
  getEntityInfo 
}: EntitySearchProviderProps) {
  const [showMentionDialog, setShowMentionDialog] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  
  // Enhanced search function with better fuzzy matching
  const searchEntities = (
    query: string,
    types?: Array<'character' | 'scene' | 'place' | 'page'>
  ) => {
    // Default to all entity types if none provided
    const entityTypes = types || ['character', 'scene', 'place', 'page'];
    
    // Handle format like "character/morg" or just "morg"
    let searchQuery = query;
    let specificTypes = entityTypes;
    let bookName: string | undefined;
    let includeAllBooks = false;
    
    // Check for book reference (Book/Type/Name format)
    const parts = query.split('/');
    if (parts.length > 2) {
      bookName = parts[0];
      const possibleType = parts[1].toLowerCase();
      
      if (['character', 'scene', 'place', 'page'].includes(possibleType)) {
        specificTypes = [possibleType as 'character' | 'scene' | 'place' | 'page'];
        searchQuery = parts[2];
      }
      
      includeAllBooks = true;
    }
    // Check if the query includes a slash - indicating a specific entity type
    else if (query.includes('/')) {
      const slashParts = query.split('/');
      const possibleType = slashParts[0].toLowerCase();
      
      // Check if the first part is a valid entity type
      if (['character', 'scene', 'place', 'page'].includes(possibleType)) {
        specificTypes = [possibleType as 'character' | 'scene' | 'place' | 'page'];
        searchQuery = slashParts.slice(1).join('/');
      }
    }
    
    // Get matching entities
    const entities = findEntitiesByPartialName(searchQuery, specificTypes, includeAllBooks || bookName !== undefined);
    
    // If we have a specific book name, filter entities
    if (bookName) {
      const filtered = entities.filter(entity => 
        entity.bookTitle?.toLowerCase().includes(bookName.toLowerCase())
      );
      return filtered;
    }
    
    // Sort entities by fuzzy match score
    return entities.sort((a, b) => {
      const scoreA = fuzzyMatch(a.name, searchQuery);
      const scoreB = fuzzyMatch(b.name, searchQuery);
      return scoreB - scoreA;
    });
  };
  
  const value = {
    searchEntities,
    getEntityInfo,
    showMentionDialog,
    setShowMentionDialog,
    mentionQuery,
    setMentionQuery
  };
  
  return (
    <EntitySearchContext.Provider value={value}>
      {children}
    </EntitySearchContext.Provider>
  );
}

export const useEntitySearch = () => {
  const context = useContext(EntitySearchContext);
  if (context === undefined) {
    throw new Error("useEntitySearch must be used within an EntitySearchProvider");
  }
  return context;
};
