
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
        <pre className="whitespace-pre-wrap bg-zinc-100 dark:bg-zinc-800 rounded-md p-4 font-mono text-sm">
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
                      <a {...props} target="_blank" rel="noopener noreferrer">
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
  
  // Styling based on message type
  const borderColor = getBorderColorForMessageType(message, isVersionRestoration, isCheckpoint);
  
  return (
    <div className={cn(
      "p-4 rounded-lg", 
      message.role === "assistant" ? "bg-white dark:bg-zinc-800/50 shadow-sm border-l-4" : "",
      message.role === "user" ? "bg-blue-50 dark:bg-blue-900/10 shadow-sm border-l-4" : "",
      message.role === "system" ? "bg-gray-50 dark:bg-gray-800/20 text-sm border-l-4" : "",
      borderColor
    )}>
      <div className="flex items-start space-x-3">
        <Avatar>
          {message.role === "user" && (
            <>
              <AvatarImage src="https://github.com/shadcn.png" alt="Your Avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </>
          )}
          {message.role === "assistant" && (
            <>
              <AvatarImage src="/ai-logo.png" alt="AI Avatar" />
              <AvatarFallback>AI</AvatarFallback>
            </>
          )}
          {message.role === "system" && (
            <>
              <AvatarImage src="/system-logo.png" alt="System Avatar" />
              <AvatarFallback>System</AvatarFallback>
            </>
          )}
        </Avatar>
        <div className="space-y-1">
          <div className="text-sm font-medium leading-none">
            {message.role === "user" && "You"}
            {message.role === "assistant" && "Assistant"}
            {message.role === "system" && "System"}
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
      
      {/* Show detected mentions button if there are any */}
      {message.mentionedEntities && message.mentionedEntities.length > 0 && (
        <div className="flex justify-end mb-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFullPrompt(!showFullPrompt)}
            className="text-xs text-muted-foreground"
          >
            {showFullPrompt ? "Hide full prompt" : "Show full prompt"}
          </Button>
        </div>
      )}
      
      {/* Message content */}
      <div className="mt-2">
        <MarkdownMessage 
          message={message} 
          setHasDetectedEntity={setHasDetectedEntity} 
          onCreateEntity={onCreateEntity} 
          onUpdateEntity={onUpdateEntity}
          currentBook={currentBook}
          showFullPrompt={showFullPrompt}
        />
      </div>
    </div>
  );
}

// Helper function for border colors
function getBorderColorForMessageType(message, isVersionRestoration, isCheckpoint) {
  if (isCheckpoint) return "border-amber-500";
  if (isVersionRestoration) return "border-green-500";
  
  if (message.entityAction === 'create') {
    return "border-green-500";
  } else if (message.entityAction === 'update') {
    return "border-blue-500";
  } else if (message.role === "assistant") {
    return "border-novel-lavender";
  } else if (message.role === "user") {
    return "border-blue-500";
  } else {
    return "border-gray-300 dark:border-gray-700";
  }
}
