
import { Book } from "@/types/novel";
import { BookOpen, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(book.id);
      toast.success("Book deleted successfully");
    }
  };

  return (
    <Card className="bg-zinc-900/70 border-zinc-800/50 overflow-hidden relative">
      <CardContent className="p-6 flex flex-col items-center">
        {getBookIcon()}
        
        <h3 className="text-xl font-bold text-white mb-1">{book.title}</h3>
        <div className="text-sm text-zinc-400 mb-4">
          {book.genre || "Fiction"}
        </div>
        
        <div className="text-sm text-zinc-300 text-center mb-6 max-w-64">
          {book.description}
        </div>
        
        {showActions && (
          <div className="w-full">
            <h4 className="text-sm font-medium text-zinc-400 mb-2">Quick Actions:</h4>
            <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1 mb-4">
              <li>Create a new character</li>
              <li>Generate a chapter outline</li>
              <li>Resume writing last scene</li>
            </ul>
          </div>
        )}
        
        <div className="w-full space-y-2">
          <Button 
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
            onClick={onSelect}
          >
            Open Book
          </Button>
          
          <Button 
            className="w-full bg-transparent hover:bg-red-900/30 text-red-500 border border-red-800/30"
            onClick={handleDelete}
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
