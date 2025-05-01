
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage as ChatMessageType, Book } from "@/types/novel";
import { ChatMessage } from './ChatMessage';

interface ChatMessageListProps {
  messages: ChatMessageType[];
  currentBook: Book | null;
  onCreateEntity: (entityType: string, entityData: any) => void;
  onUpdateEntity: (entityType: string, entityId: string, entityData: any) => void;
  loading: boolean;
}

export function ChatMessageList({ 
  messages, 
  currentBook, 
  onCreateEntity, 
  onUpdateEntity,
  loading
}: ChatMessageListProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <p className="text-lg font-medium mb-2">{`How can I help with "${currentBook?.title || 'your story'}"?`}</p>
            <p className="text-sm">Ask me to create characters, scenes, or help with your story.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              currentBook={currentBook}
              onCreateEntity={onCreateEntity}
              onUpdateEntity={onUpdateEntity}
              index={index}
            />
          ))
        )}
        <div ref={chatEndRef} />
        {loading && (
          <div className="flex items-center gap-2 text-zinc-400 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-current" />
            <div className="w-2 h-2 rounded-full bg-current animation-delay-200" />
            <div className="w-2 h-2 rounded-full bg-current animation-delay-400" />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
