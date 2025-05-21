
import { BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
  
  // Get details for the latest item
  const getLastItemDetails = () => {
    if (!lastModifiedItem) return null;
    
    // Find the actual entity to get its name/title
    if (!currentBook) return null;
    
    let entityName = "";
    const type = lastModifiedItem.type;
    const id = lastModifiedItem.id;
    
    if (type === 'pages') {
      const page = currentBook.pages.find(p => p.id === id);
      entityName = page?.title || "Page";
    } else if (type === 'characters') {
      const character = currentBook.characters.find(c => c.id === id);
      entityName = character?.name || "Character";
    } else if (type === 'scenes') {
      const scene = currentBook.scenes.find(s => s.id === id);
      entityName = scene?.title || "Scene";
    } else if (type === 'places') {
      const place = currentBook.places?.find(p => p.id === id);
      entityName = place?.name || "Place";
    } else {
      entityName = "Item";
    }
    
    return {
      type: type.slice(0, -1), // Remove 's' from the end
      name: entityName
    };
  };
  
  const lastItemDetails = getLastItemDetails();
  
  const handleLastItemClick = () => {
    if (lastModifiedItem) {
      navigate(`/${lastModifiedItem.type}/${lastModifiedItem.id}`);
    }
  };
  
  return (
    <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-primary" />
          <span className="font-bold text-lg">NovelSpark</span>
        </Link>
      </div>
      
      {/* Center content - display selected book */}
      <div className="flex-1 flex justify-center">
        {showCurrentBook && (
          <div className="flex items-center bg-muted rounded-md px-3 py-1.5">
            <div className="h-4 w-4 bg-primary/20 rounded-sm mr-2"></div>
            <span className="text-muted-foreground text-sm mr-1">Currently selected:</span>
            <span className="text-foreground text-sm font-medium">{currentBook.title}</span>
          </div>
        )}
      </div>
      
      {/* Right section - show latest page button */}
      <div className="flex items-center gap-3">
        {lastItemDetails && lastModifiedItem && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLastItemClick}
            className="text-sm"
          >
            Latest: {lastItemDetails.name} ({lastItemDetails.type})
          </Button>
        )}
      </div>
    </div>
  );
}
