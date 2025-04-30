
import { Book } from "@/types/novel";
import { BookOpen, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BookCardProps {
  book: Book;
  onSelect?: () => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function BookCard({ book, onSelect, onDelete, showActions = false }: BookCardProps) {
  const getBookIcon = () => {
    // Simple icon based on first letter of title
    return (
      <div className="h-12 w-12 bg-red-500 rounded-sm flex items-center justify-center mb-3">
        <BookOpen className="h-6 w-6 text-white" />
      </div>
    );
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      try {
        // Delete from Supabase first
        const { error } = await supabase
          .from('books')
          .delete()
          .eq('id', book.id);
          
        if (error) {
          throw error;
        }
        
        // Then update local state
        onDelete(book.id);
        toast.success("Book deleted successfully");
      } catch (error) {
        console.error("Error deleting book:", error);
        toast.error("Failed to delete book");
      }
    }
  };

  return (
    <Card className="bg-zinc-900/70 border-zinc-800/50 overflow-hidden relative cursor-pointer hover:border-zinc-700/70 transition-all" onClick={onSelect}>
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
        
        <Button 
          className="w-full bg-transparent hover:bg-red-900/30 text-red-500 border border-red-800/30 mt-2"
          onClick={handleDelete}
          size="sm"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete Book
        </Button>
      </CardContent>
    </Card>
  );
}
