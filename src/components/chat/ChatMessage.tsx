
import React from 'react';
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType, Book } from "@/types/novel";
import { MarkdownMessage } from './MarkdownMessage';

interface ChatMessageProps {
  message: ChatMessageType;
  currentBook: Book | null;
  onCreateEntity: (entityType: string, entityData: any) => void;
  onUpdateEntity: (entityType: string, entityId: string, entityData: any) => void;
  index: number;
}

export function ChatMessage({ 
  message, 
  currentBook, 
  onCreateEntity, 
  onUpdateEntity, 
  index 
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-4 animate-fade-in-up",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'backwards' 
      }}
    >
      <div
        className={cn(
          "relative group rounded-2xl px-4 py-3 max-w-[85%] text-sm",
          message.role === "user" 
            ? "bg-purple-600 text-white" 
            : message.role === "system"
              ? "bg-blue-800 text-white"
              : "bg-zinc-800 text-zinc-100"
        )}
      >
        {message.role === "assistant" ? (
          <MarkdownMessage 
            content={message.content} 
            onCreateEntity={onCreateEntity}
            onUpdateEntity={onUpdateEntity}
            currentBook={currentBook}
          />
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        <span className="absolute -bottom-5 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
        
        {message.mentionedEntities && message.mentionedEntities.length > 0 && (
          <div className="mt-2 pt-2 border-t border-zinc-700 flex flex-wrap gap-1">
            {message.mentionedEntities.map((entity) => (
              <span 
                key={`${entity.type}-${entity.id}`} 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-900/50 text-purple-200"
              >
                @{entity.type}/{entity.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
