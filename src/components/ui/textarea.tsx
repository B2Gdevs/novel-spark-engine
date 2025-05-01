
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    // Automatically adjust textarea height based on content
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      
      // Reset height first to get correct scrollHeight
      textarea.style.height = 'auto';
      
      // Set height based on scrollHeight, with a minimum height
      const newHeight = Math.max(80, Math.min(textarea.scrollHeight, 200));
      textarea.style.height = `${newHeight}px`;
    };
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onInput={handleInput}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
