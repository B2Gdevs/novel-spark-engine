
import React, { useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatMessage as ChatMessageType, Book, EntityVersion } from "@/types/novel";
import { EntityConfirmationCard } from './EntityConfirmationCard';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { FlagIcon, CheckCircle, Flag } from 'lucide-react';
import { useNovel } from '@/contexts/NovelContext';

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
  const { createChatCheckpoint, restoreChatCheckpoint } = useNovel();
  
  // State for checkpoint creation
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [checkpointDescription, setCheckpointDescription] = useState("");
  
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

  // Create a chat checkpoint
  const handleCreateCheckpoint = () => {
    if (checkpointDescription.trim()) {
      createChatCheckpoint(checkpointDescription);
      setCheckpointDescription("");
      setCheckpointOpen(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
      <div className="sticky top-2 z-10 flex justify-end mb-4">
        <Popover open={checkpointOpen} onOpenChange={setCheckpointOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white dark:bg-zinc-800 shadow-sm"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Create Checkpoint
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save the current chat state as a checkpoint</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-72">
            <div className="space-y-4">
              <h4 className="font-medium">Create Chat Checkpoint</h4>
              <p className="text-sm text-muted-foreground">
                Save the current state of your chat to return to later.
              </p>
              <Input 
                placeholder="Checkpoint description..." 
                value={checkpointDescription} 
                onChange={e => setCheckpointDescription(e.target.value)}
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleCreateCheckpoint}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Checkpoint
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {messages.map((message, index) => {
        // Check if this message is a checkpoint
        const isCheckpoint = message.isCheckpoint;
        
        return (
          <React.Fragment key={message.id}>
            {/* Optional checkpoint indicator */}
            {isCheckpoint && (
              <div className="flex items-center justify-center my-6">
                <div className="bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-full flex items-center text-sm text-amber-700 dark:text-amber-400">
                  <FlagIcon className="h-4 w-4 mr-2" />
                  Checkpoint: {message.content}
                </div>
              </div>
            )}
            
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
        );
      })}

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
