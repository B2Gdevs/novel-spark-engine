
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    
    // Set up ref
    React.useImperativeHandle(ref, () => {
      return textareaRef.current as HTMLTextAreaElement;
    });
    
    // Automatically adjust textarea height based on content
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      
      // Reset height first to get correct scrollHeight
      textarea.style.height = 'auto';
      
      // Set height based on scrollHeight, with a minimum and maximum height
      const newHeight = Math.max(80, Math.min(textarea.scrollHeight, 200));
      textarea.style.height = `${newHeight}px`;
    };
    
    // Special handling for shift+enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && e.shiftKey) {
        // Don't stop propagation - let the parent component still
        // know that shift+enter happened, but don't prevent default
        // so the new line is inserted
      }
      
      // Pass the event to any onKeyDown handler provided by the parent
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={textareaRef}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
