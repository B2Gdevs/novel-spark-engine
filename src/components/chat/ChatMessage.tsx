
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { Book } from "@/types/novel";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
    entityType?: string | null;
    entityId?: string | null;
    mentionedEntities?: Array<{
      type: string;
      id: string;
      name: string;
    }>;
    entityAction?: 'create' | 'update' | 'restore';
    entityVersionId?: string;
    isCheckpoint?: boolean;
  };
  currentBook: Book | null;
  onCreateEntity: (entityType: string, entityData: any) => void;
  onUpdateEntity: (entityType: string, entityId: string, entityData: any) => void;
  index: number;
}

interface MarkdownMessageProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
    entityType?: string | null;
    entityId?: string | null;
    mentionedEntities?: Array<{
      type: string;
      id: string;
      name: string;
    }>;
    entityAction?: 'create' | 'update' | 'restore';
    entityVersionId?: string;
    isCheckpoint?: boolean;
  };
  setHasDetectedEntity: (hasDetected: boolean) => void;
  onCreateEntity: (entityType: string, entityData: any) => void;
  onUpdateEntity: (entityType: string, entityId: string, entityData: any) => void;
  currentBook: Book | null;
  showFullPrompt: boolean;
}

function MarkdownMessage({
  message,
  setHasDetectedEntity,
  onCreateEntity,
  onUpdateEntity,
  currentBook,
  showFullPrompt
}: MarkdownMessageProps) {
  // Function to extract and process entity mentions
  const processEntityMentions = (text: string) => {
    // Regular expression to find potential entity mentions
    const entityRegex = /\[\[(character|scene|page|place):([^\]]+)\]\]/g;
    let match;
    let lastIndex = 0;
    const elements = [];

    while ((match = entityRegex.exec(text)) !== null) {
      const [fullMatch, entityType, entityDataJson] = match;
      const entityData = JSON.parse(entityDataJson);

      // Push the text before the match
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }

      // Push the button for entity creation/update
      elements.push(
        <Button
          key={fullMatch}
          variant="secondary"
          size="sm"
          onClick={() => {
            if (entityData.id) {
              onUpdateEntity(entityType, entityData.id, entityData);
            } else {
              onCreateEntity(entityType, entityData);
            }
            setHasDetectedEntity(true);
          }}
        >
          {entityType}: {entityData.name || entityData.title}
        </Button>
      );

      lastIndex = match.index + fullMatch.length;
    }

    // Push the remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements;
  };

  // Process the content to find and replace entity mentions
  const contentElements = processEntityMentions(message.content);

  return (
    <div className="prose dark:prose-invert max-w-none">
      {showFullPrompt ? (
        <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 rounded-md p-4 font-mono text-sm text-gray-900">
          {message.content}
        </pre>
      ) : (
        <>
          {contentElements.map((element, index) => {
            if (typeof element === 'string') {
              return (
                <ReactMarkdown
                  key={`markdown-${index}`}
                  components={{
                    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {props.children}
                      </a>
                    ),
                  }}
                >
                  {element}
                </ReactMarkdown>
              );
            } else {
              return element;
            }
          })}
        </>
      )}
    </div>
  );
}

export function ChatMessage({
  message,
  currentBook,
  onCreateEntity,
  onUpdateEntity,
  index,
}: ChatMessageProps) {
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [hasDetectedEntity, setHasDetectedEntity] = useState(false);
  
  // Versioning and Checkpoint handling
  const isVersionRestoration = message.entityAction === 'restore';
  const isCheckpoint = message.isCheckpoint;
  
  return (
    <div className={cn(
      "p-4 rounded-lg my-3 chat-message",
      message.role === "assistant" ? "chat-message-assistant" : "",
      message.role === "user" ? "chat-message-user" : "",
      message.role === "system" ? "chat-message-system" : "",
      isVersionRestoration ? "border-l-4 border-l-green-500" : "",
      isCheckpoint ? "border-l-4 border-l-amber-500" : "",
      message.entityAction === 'create' ? "border-l-4 border-l-green-500" : "",
      message.entityAction === 'update' ? "border-l-4 border-l-blue-500" : ""
    )}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          {message.role === "user" && (
            <>
              <AvatarImage src="https://github.com/shadcn.png" alt="Your Avatar" />
              <AvatarFallback className="bg-blue-100 text-blue-800">U</AvatarFallback>
            </>
          )}
          {message.role === "assistant" && (
            <>
              <AvatarImage src="/ai-logo.png" alt="AI Avatar" />
              <AvatarFallback className="bg-purple-100 text-purple-800">AI</AvatarFallback>
            </>
          )}
          {message.role === "system" && (
            <>
              <AvatarImage src="/system-logo.png" alt="System Avatar" />
              <AvatarFallback className="bg-gray-100 text-gray-800">SYS</AvatarFallback>
            </>
          )}
        </Avatar>
        <div className="space-y-1 flex-1">
          <div className="text-sm font-medium leading-none flex justify-between items-center">
            <span>
              {message.role === "user" && "You"}
              {message.role === "assistant" && "Assistant"}
              {message.role === "system" && "System"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          
          {/* Message content */}
          <div className="mt-2 text-gray-800">
            <MarkdownMessage 
              message={message} 
              setHasDetectedEntity={setHasDetectedEntity} 
              onCreateEntity={onCreateEntity} 
              onUpdateEntity={onUpdateEntity}
              currentBook={currentBook}
              showFullPrompt={showFullPrompt}
            />
          </div>
          
          {/* Show detected mentions button if there are any */}
          {message.mentionedEntities && message.mentionedEntities.length > 0 && (
            <div className="flex justify-end mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {showFullPrompt ? "Hide full prompt" : "Show full prompt"}
              </Button>
            </div>
          )}
          
          {/* Entity badges */}
          {message.mentionedEntities && message.mentionedEntities.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-1">
              {message.mentionedEntities.map((entity) => (
                <span 
                  key={`${entity.type}-${entity.id}`} 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800"
                >
                  @{entity.type}/{entity.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
