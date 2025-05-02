
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

interface UnifiedChatProps {
  mode: 'page' | 'dialog';
  onClose?: () => void;
}

export function UnifiedChat({ mode, onClose }: UnifiedChatProps) {
  const { project, currentBook, clearChatHistory } = useNovel();
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
  
  // Handlers
  const handleCreateEntity = (entityType: string, entityData: any) => {
    // Will be implemented in a separate component
  };

  const handleUpdateEntity = (entityType: string, entityId: string, entityData: any) => {
    // Will be implemented in a separate component
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
