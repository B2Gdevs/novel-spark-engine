
import { useState, useEffect } from 'react';
import { useNovel } from '@/contexts/NovelContext';

export function useEntityContext() {
  const { project, associateChatWithEntity } = useNovel();
  const [linkedEntityType, setLinkedEntityType] = useState<string | null>(null);
  const [linkedEntityId, setLinkedEntityId] = useState<string | null>(null);

  // Update linked entity state when current chat context changes
  useEffect(() => {
    if (project.currentChatContext) {
      setLinkedEntityType(project.currentChatContext.entityType);
      setLinkedEntityId(project.currentChatContext.entityId);
    } else {
      setLinkedEntityType(null);
      setLinkedEntityId(null);
    }
  }, [project.currentChatContext]);
  
  return {
    linkedEntityType,
    linkedEntityId,
    associateChatWithEntity
  };
}
