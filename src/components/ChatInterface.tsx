
import { useNovel } from "@/contexts/NovelContext";
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessageList } from './chat/ChatMessageList';
import { ChatInput } from './chat/ChatInput';
import { useChatMessages } from '@/hooks/useChatMessages';

export function ChatInterface() {
  const { currentBook } = useNovel();
  
  const {
    message,
    setMessage,
    loading,
    mentionSearch,
    mentionSuggestions,
    linkedEntityType,
    linkedEntityId,
    handleSubmit,
    handleCreateEntity,
    handleUpdateEntity,
    handleClearChat,
    handleMentionSelect,
    chatHistory
  } = useChatMessages();

  // If no book is selected, don't render the chat interface
  if (!currentBook) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8">
        <p className="text-lg text-zinc-400">
          Please select a book first to use the AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        currentBook={currentBook}
        linkedEntityType={linkedEntityType}
        linkedEntityId={linkedEntityId}
        onClearChat={handleClearChat}
      />
      
      <ChatMessageList
        messages={chatHistory}
        currentBook={currentBook}
        onCreateEntity={handleCreateEntity}
        onUpdateEntity={handleUpdateEntity}
        loading={loading}
      />

      <ChatInput 
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        loading={loading}
        mentionSearch={mentionSearch}
        mentionSuggestions={mentionSuggestions}
        onMentionSelect={handleMentionSelect}
        currentBookId={currentBook.id}
      />
    </div>
  );
}
