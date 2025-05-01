
import React from 'react';
import { Book } from "@/types/novel";

interface EntitySearchProviderProps {
  currentBook: Book | null;
  children: React.ReactNode;
  findEntitiesByPartialName: (
    partialName: string,
    entityTypes: Array<'character' | 'scene' | 'place' | 'page'>
  ) => Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    description?: string;
  }>;
  getEntityInfo: (entityType: string, entityId: string) => any;
}

export function EntitySearchProvider({ 
  currentBook, 
  children,
  findEntitiesByPartialName,
  getEntityInfo 
}: EntitySearchProviderProps) {
  
  return <>{children}</>;
}
