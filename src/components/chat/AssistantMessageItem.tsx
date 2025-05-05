
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
          ? "bg-blue-100 text-gray-800 border-2 border-gray-400 rounded-br-none" 
          : "bg-gray-50 text-gray-800 border-2 border-gray-400 rounded-bl-none shadow-sm"
      )}>
        <div className="prose prose-sm max-w-none">
          {message.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-2 text-gray-800">
              {paragraph}
            </p>
          ))}
        </div>
        
        {message.mentionedEntities && message.mentionedEntities.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300 flex flex-wrap gap-1">
            {message.mentionedEntities.map((entity) => (
              <span 
                key={`${entity.type}-${entity.id}`} 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-300"
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
