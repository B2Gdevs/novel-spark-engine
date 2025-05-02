
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

export function EntitySearchProvider({ 
  currentBook, 
  children,
  findEntitiesByPartialName,
  getEntityInfo 
}: EntitySearchProviderProps) {
  const [showMentionDialog, setShowMentionDialog] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  
  // Wrapper for the search function that includes improved fuzzy matching
  const searchEntities = (
    query: string,
    types?: Array<'character' | 'scene' | 'place' | 'page'>
  ) => {
    // Default to all entity types if none provided
    const entityTypes = types || ['character', 'scene', 'place', 'page'];
    
    // Handle format like "character/morg" or just "morg"
    let searchQuery = query;
    let specificTypes = entityTypes;
    
    // Check if the query includes a slash - indicating a specific entity type
    if (query.includes('/')) {
      const parts = query.split('/');
      const possibleType = parts[0].toLowerCase();
      
      // Check if the first part is a valid entity type
      if (['character', 'scene', 'place', 'page'].includes(possibleType)) {
        specificTypes = [possibleType as 'character' | 'scene' | 'place' | 'page'];
        searchQuery = parts.slice(1).join('/');
      }
    }
    
    // Check if query includes book reference (Book/Type/Name format)
    let includeAllBooks = false;
    if (query.split('/').length > 2) {
      includeAllBooks = true;
    }
    
    // Call the provided search function with our processed parameters
    return findEntitiesByPartialName(searchQuery, specificTypes, includeAllBooks);
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
