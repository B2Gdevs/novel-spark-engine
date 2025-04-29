
import { Settings, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { useNovel } from "@/contexts/NovelContext";

export function Toolbar() {
  const location = useLocation();
  const { currentBook } = useNovel();
  
  return (
    <div className="h-12 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-purple-400" />
          <span className="font-bold text-lg text-white">NovelSpark</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        {currentBook && (
          <div className="flex items-center bg-zinc-800/70 rounded-md px-3 py-1.5 mr-2">
            <div className="h-4 w-4 bg-red-500 rounded-sm mr-2"></div>
            <span className="text-white text-sm font-medium">{currentBook.title}</span>
            <ChevronRight className="h-4 w-4 text-zinc-400 ml-1" />
          </div>
        )}
        
        <Button
          variant="ghost"
          className="text-zinc-300 hover:text-white hover:bg-zinc-800 flex gap-2 items-center px-3 py-1.5 h-8 text-sm"
        >
          <span className="text-sm">+ New Book</span>
        </Button>
        
        <Link to="/settings">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-zinc-300 hover:text-white hover:bg-zinc-800 h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
