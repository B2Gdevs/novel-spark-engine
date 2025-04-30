
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useNovel } from "@/contexts/NovelContext";

export function Toolbar() {
  const location = useLocation();
  const { currentBook } = useNovel();
  
  // Only show the current book if we're not on the homepage
  const isHomePage = location.pathname === "/";
  const showCurrentBook = currentBook && !isHomePage;
  
  return (
    <div className="h-12 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-purple-400" />
          <span className="font-bold text-lg text-white">NovelSpark</span>
        </Link>
      </div>
      
      {/* Center content - display selected book */}
      <div className="flex-1 flex justify-center">
        {showCurrentBook && (
          <div className="flex items-center bg-zinc-800/70 rounded-md px-3 py-1.5">
            <div className="h-4 w-4 bg-red-500 rounded-sm mr-2"></div>
            <span className="text-white text-sm font-medium">{currentBook.title}</span>
            <ChevronRight className="h-4 w-4 text-zinc-400 ml-1" />
          </div>
        )}
      </div>
      
      {/* Right section - intentionally empty now that we've moved New Book to the books page */}
      <div className="flex items-center gap-3">
        {/* Placeholder for future actions/buttons like user profile, settings, etc. */}
      </div>
    </div>
  );
}
