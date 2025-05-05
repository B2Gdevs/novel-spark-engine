
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useNovel } from "@/contexts/NovelContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Toolbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentBook, getLastModifiedItem } = useNovel();
  
  // Only show the current book if we're not on the homepage
  const isHomePage = location.pathname === "/";
  const showCurrentBook = currentBook && !isHomePage;

  // Get the latest page for quick access
  const lastModifiedItem = currentBook ? getLastModifiedItem(currentBook.id) : null;
  
  const handleLastItemClick = () => {
    if (lastModifiedItem) {
      navigate(`/${lastModifiedItem.type}/${lastModifiedItem.id}`);
    }
  };
  
  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 shadow-sm">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-purple-600" />
          <span className="font-bold text-lg text-gray-800">NovelSpark</span>
        </Link>
      </div>
      
      {/* Center content - display selected book */}
      <div className="flex-1 flex justify-center">
        {showCurrentBook && (
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5">
            <div className="h-4 w-4 bg-purple-500 rounded-sm mr-2"></div>
            <span className="text-gray-800 text-sm font-medium">{currentBook.title}</span>
            <ChevronRight className="h-4 w-4 text-gray-500 ml-1" />
          </div>
        )}
      </div>
      
      {/* Right section - show latest page button */}
      <div className="flex items-center gap-3">
        {lastModifiedItem && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLastItemClick}
            className="text-sm text-gray-600 hover:text-gray-900 border-gray-200"
          >
            Latest: {lastModifiedItem.title} ({lastModifiedItem.type.slice(0, -1)})
          </Button>
        )}
      </div>
    </div>
  );
}
