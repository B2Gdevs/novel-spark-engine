import { Book } from "@/types/novel";
import { BookOpen, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";

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
      // Set data for drag operation
      e.dataTransfer.setData('text/plain', book.id);
      // Show trash zone
      setDraggedBookId(book.id);
      // Set ghost image (optional)
      const ghost = document.createElement('div');
      ghost.innerHTML = `<div style="padding: 10px; background: rgba(0,0,0,0.7); border-radius: 5px; color: white;">${book.title}</div>`;
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 50, 25);
      setTimeout(() => document.body.removeChild(ghost), 0);
    }
  };

  const handleDragEnd = () => {
    if (setDraggedBookId) {
      setDraggedBookId(null);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
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
      className="bg-zinc-900/70 border-zinc-800/50 overflow-hidden relative cursor-pointer hover:border-zinc-700/70 transition-all" 
      onClick={onSelect}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
        
        {/* Keeping the old delete button as a fallback but visually less prominent */}
        <Button 
          className="w-full bg-transparent hover:bg-red-900/30 text-red-500 border border-red-800/30 mt-2 opacity-60"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          size="sm"
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" /> Delete Book
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
