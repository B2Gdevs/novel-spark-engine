
import React, { useState, useEffect, useRef } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { AtSign, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEntitySearch } from "@/contexts/novel/provider/EntitySearchProvider";
import { Badge } from "@/components/ui/badge";

interface MentionPopoverProps {
  onSelectMention: (mention: {
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    bookId?: string;
    bookTitle?: string;
  }) => void;
  currentBookId?: string;
}

export function MentionPopover({ onSelectMention, currentBookId }: MentionPopoverProps) {
  const { searchEntities } = useEntitySearch();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    description?: string;
    bookId?: string;
    bookTitle?: string;
  }>>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus on the input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Update search results when query changes
  useEffect(() => {
    if (query.trim().length > 0) {
      const searchResults = searchEntities(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, searchEntities]);
  
  const handleMentionSelect = (mention: {
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    bookId?: string;
    bookTitle?: string;
  }) => {
    onSelectMention(mention);
    setIsOpen(false);
    setQuery("");
  };
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'character': return "bg-purple-500";
      case 'scene': return "bg-blue-500";
      case 'place': return "bg-green-500";
      case 'page': return "bg-amber-500";
      default: return "bg-zinc-500";
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (results.length > 0) {
        handleMentionSelect(results[0]);
        e.preventDefault();
      }
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 rounded-full p-0 hover:bg-zinc-800"
        >
          <AtSign size={16} className="text-zinc-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 bg-zinc-900 border-zinc-800 text-white p-0"
        align="start"
        alignOffset={-40}
      >
        <div className="p-2">
          <div className="relative">
            <Search 
              size={16} 
              className="absolute left-2.5 top-2.5 text-zinc-400" 
            />
            <Input
              ref={inputRef}
              placeholder="Search entities..."
              className="pl-8 bg-zinc-800 border-zinc-700"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="mt-2">
            {results.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={cn(
                      "flex items-center p-2 hover:bg-zinc-800 rounded cursor-pointer",
                      index === 0 ? "bg-zinc-800/50" : ""
                    )}
                    onClick={() => handleMentionSelect(result)}
                  >
                    <span className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      getTypeColor(result.type)
                    )} />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{result.name}</span>
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1 py-0 h-4 bg-zinc-800"
                        >
                          {result.type}
                        </Badge>
                      </div>
                      {result.bookTitle && result.bookId && result.bookId !== currentBookId && (
                        <p className="text-xs text-zinc-400 truncate">
                          From: {result.bookTitle}
                        </p>
                      )}
                      {result.description && (
                        <p className="text-xs text-zinc-400 truncate">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : query.trim().length > 0 ? (
              <p className="text-sm text-zinc-500 p-2">No results found</p>
            ) : (
              <p className="text-sm text-zinc-500 p-2">Type to search entities</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
