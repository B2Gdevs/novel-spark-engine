
import { Settings } from "lucide-react";
import { BookSelector } from "./BookSelector";
import { Button } from "./ui/button";

export function Toolbar() {
  return (
    <div className="h-16 bg-zinc-900/50 backdrop-blur-lg border-b border-zinc-800/50 flex items-center justify-between px-4 fixed top-0 w-full z-10">
      <div className="flex items-center">
        <span className="font-bold text-lg text-white mr-8">NovelSpark</span>
        <BookSelector />
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800/50"
        >
          <span>+</span>
          <span>New Book</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-zinc-900/50 hover:bg-zinc-800/50"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

