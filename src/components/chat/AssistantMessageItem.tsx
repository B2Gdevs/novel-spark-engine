
import React from 'react';
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/novel";

interface AssistantMessageItemProps {
  message: ChatMessage;
}

export function AssistantMessageItem({ message }: AssistantMessageItemProps) {
  return (
    <div className={cn(
      "flex animate-fade-in-up",
      message.role === "user" ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-2xl",
        message.role === "user" 
          ? "bg-purple-800 text-white rounded-br-none" 
          : "bg-zinc-800 text-zinc-200 rounded-bl-none"
      )}>
        <div className="prose prose-sm max-w-none">
          {message.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className={message.role === "user" ? "mb-2 text-white" : "mb-2 text-zinc-200"}>
              {paragraph}
            </p>
          ))}
        </div>
        
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
