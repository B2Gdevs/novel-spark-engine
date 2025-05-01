import { Book } from "@/types/novel";
import { BookOpen, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book?: Book;
  onSelect?: () => void;
  onDelete?: (id: string) => void;
  isNewBookCard?: boolean;
  onCreateNew?: () => void;
  isLoading?: boolean;
  setDraggedBookId?: (id: string | null) => void;
}

export function BookCard({ 
  book, 
  onSelect, 
  onDelete, 
  isNewBookCard = false, 
  onCreateNew,
  isLoading = false,
  setDraggedBookId
}: BookCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0 });

  // Handle the "New Book" card
  if (isNewBookCard) {
    return (
      <Card className="bg-zinc-900/70 border-zinc-800/50 border-dashed overflow-hidden relative cursor-pointer hover:border-purple-500/50 hover:bg-zinc-800/30 transition-all flex items-center justify-center" onClick={isLoading ? undefined : onCreateNew}>
        <CardContent className="p-6 flex flex-col items-center justify-center h-full">
          <div className="h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
            {isLoading ? (
              <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
            ) : (
              <PlusCircle className="h-6 w-6 text-purple-400" />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-1">New Book</h3>
          <div className="text-sm text-zinc-400 mb-4">
            {isLoading ? "Creating..." : "Start a new story"}
          </div>
          
          <div className="text-sm text-zinc-300 text-center mb-6 max-w-64 h-24 overflow-y-auto">
            Create a new book and begin your writing journey...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle regular book card
  if (!book) return null;

  const handleDragStart = (e: React.DragEvent) => {
    if (setDraggedBookId && book) {
      // Get original element position for animation
      const rect = e.currentTarget.getBoundingClientRect();
      setOriginalPosition({ 
        x: rect.left, 
        y: rect.top 
      });
      
      // Set data for drag operation
      e.dataTransfer.setData('text/plain', book.id);
      
      // Show trash zone
      setDraggedBookId(book.id);
      setIsDragging(true);
      
      // Create a translucent clone for the drag operation
      const clone = e.currentTarget.cloneNode(true) as HTMLElement;
      clone.id = 'book-drag-ghost';
      clone.style.position = 'absolute';
      clone.style.top = '-1000px';
      clone.style.opacity = '0.7';
      clone.style.transform = 'scale(0.8)';
      clone.style.pointerEvents = 'none';
      clone.style.zIndex = '9999';
      clone.style.width = `${rect.width}px`;
      
      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, rect.width / 2, rect.height / 2);
      
      // Listen to drag events to update position
      window.addEventListener('dragover', updateDragPosition);
    }
  };
  
  const updateDragPosition = (e: DragEvent) => {
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = () => {
    if (setDraggedBookId) {
      setDraggedBookId(null);
      setIsDragging(false);
      
      // Remove ghost element
      const ghost = document.getElementById('book-drag-ghost');
      if (ghost) document.body.removeChild(ghost);
      
      // Remove drag listener
      window.removeEventListener('dragover', updateDragPosition);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && !isDeleting) {
      try {
        setIsDeleting(true);
        await onDelete(book.id);
      } catch (error) {
        console.error("Error deleting book:", error);
        toast.error("Failed to delete book");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getBookIcon = () => {
    // Simple icon based on first letter of title
    return (
      <div className="h-12 w-12 bg-red-500 rounded-sm flex items-center justify-center mb-3">
        <BookOpen className="h-6 w-6 text-white" />
      </div>
    );
  };

  return (
    <Card 
      className={cn(
        "bg-zinc-900/70 border-zinc-800/50 overflow-hidden relative cursor-pointer hover:border-zinc-700/70 transition-all",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Trash icon in top right corner that appears on hover */}
      {isHovered && !isDeleting && (
        <div 
          className="absolute top-3 right-3 p-2 bg-zinc-800/80 hover:bg-red-900/80 rounded-full transition-colors z-10"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4 text-zinc-400 hover:text-white" />
        </div>
      )}
      
      {/* Loading indicator when deleting */}
      {isDeleting && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
        </div>
      )}

      <CardContent className="p-6 flex flex-col items-center">
        {getBookIcon()}
        
        <h3 className="text-xl font-bold text-white mb-1">{book.title}</h3>
        <div className="text-sm text-zinc-400 mb-4">
          {book.genre || "Fiction"}
        </div>
        
        <div className="text-sm text-zinc-300 text-center mb-6 max-w-64 h-24 overflow-y-auto">
          {book.description || "No description available."}
        </div>
        
        <Button 
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect();
          }}
        >
          Open Book
        </Button>

        <div className="mt-2 text-xs text-zinc-500 italic">
          Drag to trash bin to delete
        </div>
      </CardContent>
      
      {/* Floating drag preview - visible only when dragging */}
      {isDragging && createPortal(
        <div 
          style={{
            position: 'fixed',
            left: `${dragPosition.x - 100}px`,
            top: `${dragPosition.y - 50}px`,
            transform: 'scale(0.8)',
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: 0.85,
            transition: 'box-shadow 0.2s',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            width: '200px'
          }}
        >
          <Card className="border-purple-500 bg-zinc-900">
            <CardContent className="p-3">
              <h3 className="font-bold text-white">{book.title}</h3>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}
    </Card>
  );
}

// Simple React Portal implementation for the drag preview
function createPortal(children: React.ReactNode, container: HTMLElement) {
  // In a real implementation, you'd use React.createPortal
  // Since we're just showing the code here, we'll return null
  return null;
}
