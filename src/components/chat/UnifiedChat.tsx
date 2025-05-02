
import React, { useState } from 'react';
import { useNovel } from "@/contexts/NovelContext";
import { cn } from "@/lib/utils";
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { EmptyChat } from './EmptyChat';
import { useChatSubmission } from '@/hooks/useChatSubmission';
import { useMentionDetection } from '@/hooks/useMentionDetection';
import { useEntityContext } from '@/hooks/useEntityContext';
import { EntityProcessor } from './EntityProcessor';
import { toast } from "sonner";

interface UnifiedChatProps {
  mode: 'page' | 'dialog';
  onClose?: () => void;
}

export function UnifiedChat({ mode, onClose }: UnifiedChatProps) {
  const { 
    project, 
    currentBook, 
    clearChatHistory, 
    addCharacter, 
    updateCharacter,
    addScene,
    updateScene,
    addPage,
    updatePage,
    addPlace,
    updatePlace,
    addChatMessage 
  } = useNovel();
  const [message, setMessage] = useState("");
  
  // Custom hooks to split functionality
  const { linkedEntityType, linkedEntityId } = useEntityContext();
  const { handleSubmit, loading, findEntitiesByPartialName } = useChatSubmission({
    linkedEntityType,
    linkedEntityId,
    currentBook
  });
  const { mentionSearch, mentionSuggestions, handleMentionSelect } = useMentionDetection(
    message, 
    currentBook,
    findEntitiesByPartialName
  );
  
  // Entity processing state
  const [processingEntity, setProcessingEntity] = useState<{
    type: 'character' | 'scene' | 'page' | 'place';
    data: any;
    exists: boolean;
    id?: string;
  } | null>(null);
  
  // Handlers
  const handleCreateEntity = (entityType: string, entityData: any) => {
    let newId: string | undefined;
    
    switch (entityType) {
      case 'character':
        newId = addCharacter(entityData);
        toast.success(`Character "${entityData.name}" created successfully`);
        break;
      case 'scene':
        newId = addScene(entityData);
        toast.success(`Scene "${entityData.title}" created successfully`);
        break;
      case 'page':
        newId = addPage(entityData);
        toast.success(`Page "${entityData.title}" created successfully`);
        break;
      case 'place':
        newId = addPlace(entityData);
        toast.success(`Place "${entityData.name}" created successfully`);
        break;
    }
    
    // Add confirmation message to chat
    if (newId) {
      addChatMessage({
        role: 'system',
        content: `${entityType} created successfully`,
        entityType: entityType,
        entityId: newId
      });
    }
  };

  const handleUpdateEntity = (entityType: string, entityId: string, entityData: any) => {
    switch (entityType) {
      case 'character':
        updateCharacter(entityId, entityData);
        toast.success("Character updated successfully");
        break;
      case 'scene':
        updateScene(entityId, entityData);
        toast.success("Scene updated successfully");
        break;
      case 'page':
        updatePage(entityId, entityData);
        toast.success("Page updated successfully");
        break;
      case 'place':
        updatePlace(entityId, entityData);
        toast.success("Place updated successfully");
        break;
    }
  };

  const handleClearChat = () => {
    // Only allow clearing if not linked to an entity
    if (!linkedEntityType && !linkedEntityId) {
      clearChatHistory();
    }
  };
  
  const handleMessageSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentMessage = message;
    setMessage("");
    await handleSubmit(currentMessage);
  };
  
  const handleMentionSelection = (suggestion: {
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    bookId?: string;
    bookTitle?: string;
  }) => {
    const newMessage = handleMentionSelect(message, suggestion, currentBook?.id);
    setMessage(newMessage);
  };

  // If no book is selected, show empty state
  if (!currentBook) {
    return <EmptyChat currentBook={null} mode={mode} />;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {processingEntity && (
        <EntityProcessor 
          type={processingEntity.type}
          data={processingEntity.data}
          exists={processingEntity.exists}
          id={processingEntity.id}
          onEntityProcessed={() => setProcessingEntity(null)}
        />
      )}
      
      <ChatHeader 
        currentBook={currentBook}
        linkedEntityType={linkedEntityType}
        linkedEntityId={linkedEntityId}
        onClearChat={handleClearChat}
        onClose={onClose}
      />
      
      {project.chatHistory.length === 0 ? (
        <div className="flex-1 overflow-y-auto">
          <EmptyChat 
            currentBook={currentBook} 
            mode={mode} 
            onPromptClick={(prompt) => {
              setMessage(prompt);
              setTimeout(() => {
                handleMessageSubmit();
              }, 100);
            }} 
          />
        </div>
      ) : (
        <ChatMessageList
          messages={project.chatHistory}
          currentBook={currentBook}
          onCreateEntity={handleCreateEntity}
          onUpdateEntity={handleUpdateEntity}
          loading={loading}
        />
      )}

      <ChatInput 
        message={message}
        setMessage={setMessage}
        onSubmit={handleMessageSubmit}
        loading={loading}
        mentionSearch={mentionSearch}
        mentionSuggestions={mentionSuggestions}
        onMentionSelect={handleMentionSelection}
        currentBookId={currentBook.id}
      />
    </div>
  );
}
