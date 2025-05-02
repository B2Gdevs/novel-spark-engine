
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
  // Store pending entities with the messageId they belong to
  const [pendingEntities, setPendingEntities] = useState<Array<{
    type: 'character' | 'scene' | 'page' | 'place';
    data: any;
    exists: boolean;
    id?: string;
    messageId: string; // Link to the message that created this entity
  }>>([]);
  
  const handleCreateEntity = (entityType: string, entityData: any, messageId: string) => {
    // Check if we already have a pending entity of this type with similar data
    const existingEntityIndex = pendingEntities.findIndex(entity => 
      entity.messageId === messageId && 
      entity.type === entityType && 
      (entity.type === 'character' ? entity.data.name === entityData.name : 
       entity.type === 'scene' ? entity.data.title === entityData.title :
       entity.type === 'page' ? entity.data.title === entityData.title :
       entity.data.name === entityData.name)
    );
    
    // If this entity already exists in our pending list, return early
    if (existingEntityIndex !== -1) return;
    
    setPendingEntities(prev => [...prev, {
      type: entityType as 'character' | 'scene' | 'page' | 'place',
      data: entityData,
      exists: false,
      messageId
    }]);
  };

  const handleUpdateEntity = (entityType: string, entityId: string, entityData: any, messageId: string) => {
    // Check if we already have this update pending
    const existingEntityIndex = pendingEntities.findIndex(entity => 
      entity.messageId === messageId && 
      entity.type === entityType && 
      entity.id === entityId
    );
    
    // If this entity update already exists in our pending list, return early
    if (existingEntityIndex !== -1) return;
    
    setPendingEntities(prev => [...prev, {
      type: entityType as 'character' | 'scene' | 'page' | 'place',
      data: entityData,
      exists: true,
      id: entityId,
      messageId
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

  // Gets pending entities for a specific message
  const getMessagePendingEntities = (messageId: string) => {
    return pendingEntities.filter(entity => entity.messageId === messageId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message, index) => (
        <React.Fragment key={message.id}>
          <ChatMessage 
            message={message}
            currentBook={currentBook}
            onCreateEntity={(entityType, entityData) => handleCreateEntity(entityType, entityData, message.id)}
            onUpdateEntity={(entityType, entityId, entityData) => handleUpdateEntity(entityType, entityId, entityData, message.id)}
            index={index}
          />
          
          {/* Show entity confirmation cards right after their respective messages */}
          {getMessagePendingEntities(message.id).map((entity, entityIndex) => (
            <EntityConfirmationCard
              key={`${entity.type}-${entityIndex}`}
              entityType={entity.type}
              entityData={entity.data}
              onConfirm={() => handleConfirmEntity(pendingEntities.indexOf(entity))}
              onCancel={() => handleCancelEntity(pendingEntities.indexOf(entity))}
            />
          ))}
        </React.Fragment>
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
