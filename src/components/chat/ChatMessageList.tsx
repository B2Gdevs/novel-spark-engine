
import React, { useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatMessage as ChatMessageType, Book } from "@/types/novel";
import { EntityConfirmationCard } from './EntityConfirmationCard';

interface ChatMessageListProps {
  messages: ChatMessageType[];
  currentBook: Book | null;
  onCreateEntity: (entityType: string, entityData: any) => void;
  onUpdateEntity: (entityType: string, entityId: string, entityData: any) => void;
  loading?: boolean;
}

export function ChatMessageList({ 
  messages, 
  currentBook,
  onCreateEntity,
  onUpdateEntity,
  loading = false
}: ChatMessageListProps) {
  const [pendingEntities, setPendingEntities] = useState<Array<{
    type: 'character' | 'scene' | 'page' | 'place';
    data: any;
    exists: boolean;
    id?: string;
  }>>([]);
  
  const handleCreateEntity = (entityType: string, entityData: any) => {
    setPendingEntities(prev => [...prev, {
      type: entityType as 'character' | 'scene' | 'page' | 'place',
      data: entityData,
      exists: false
    }]);
  };

  const handleUpdateEntity = (entityType: string, entityId: string, entityData: any) => {
    setPendingEntities(prev => [...prev, {
      type: entityType as 'character' | 'scene' | 'page' | 'place',
      data: entityData,
      exists: true,
      id: entityId
    }]);
  };

  const handleConfirmEntity = (index: number) => {
    const entity = pendingEntities[index];
    if (!entity) return;
    
    const updatedPendingEntities = [...pendingEntities];
    updatedPendingEntities.splice(index, 1);
    setPendingEntities(updatedPendingEntities);
    
    if (entity.exists && entity.id) {
      onUpdateEntity(entity.type, entity.id, entity.data);
    } else {
      onCreateEntity(entity.type, entity.data);
    }
  };

  const handleCancelEntity = (index: number) => {
    const updatedPendingEntities = [...pendingEntities];
    updatedPendingEntities.splice(index, 1);
    setPendingEntities(updatedPendingEntities);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message, index) => (
        <ChatMessage 
          key={message.id}
          message={message}
          currentBook={currentBook}
          onCreateEntity={handleCreateEntity}
          onUpdateEntity={handleUpdateEntity}
          index={index}
        />
      ))}
      
      {/* Entity confirmation cards */}
      {pendingEntities.map((entity, index) => (
        <EntityConfirmationCard
          key={`${entity.type}-${index}`}
          entityType={entity.type}
          entityData={entity.data}
          onConfirm={() => handleConfirmEntity(index)}
          onCancel={() => handleCancelEntity(index)}
        />
      ))}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-start">
          <div className="bg-zinc-700 rounded-2xl px-4 py-3 flex items-center space-x-2">
            <div className="animate-pulse h-2 w-2 bg-zinc-300 rounded-full"></div>
            <div className="animate-pulse h-2 w-2 bg-zinc-300 rounded-full animation-delay-200"></div>
            <div className="animate-pulse h-2 w-2 bg-zinc-300 rounded-full animation-delay-400"></div>
          </div>
        </div>
      )}
    </div>
  );
}
