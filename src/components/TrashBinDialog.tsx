
import { useState, useEffect } from "react";
import { useNovel } from "@/contexts/NovelContext";
import { Book } from "@/types/novel";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "./ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { Button } from "./ui/button";
import { ArrowUpFromLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TrashBinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrashBinDialog({ open, onOpenChange }: TrashBinDialogProps) {
  const [deletedBooks, setDeletedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { project, setProject } = useNovel();

  // Fetch deleted books when dialog opens
  useEffect(() => {
    if (open) {
      fetchDeletedBooks();
    }
  }, [open]);

  const fetchDeletedBooks = async () => {
    setIsLoading(true);
    try {
      // Fetch soft-deleted books from Supabase
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const transformedBooks = data.map(dbBook => ({
          id: dbBook.id,
          title: dbBook.title,
          description: dbBook.description || "",
          genre: dbBook.genre || "Fiction",
          characters: [],
          scenes: [],
          events: [],
          notes: [],
          pages: [],
          createdAt: dbBook.created_at,
          updatedAt: dbBook.updated_at,
          deletedAt: dbBook.deleted_at
        }));
        
        setDeletedBooks(transformedBooks);
      }
    } catch (error) {
      console.error("Error fetching deleted books:", error);
      toast.error("Failed to load deleted books");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRestoreBook = async (book: Book) => {
    setRestoringId(book.id);
    try {
      // Update the book in Supabase to mark as not deleted
      const { error } = await supabase
        .from('books')
        .update({
          is_deleted: false,
          deleted_at: null
        })
        .eq('id', book.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setProject(prev => ({
        ...prev,
        books: [...prev.books, book]
      }));
      
      // Remove from deleted books list
      setDeletedBooks(prev => prev.filter(b => b.id !== book.id));
      
      toast.success(`"${book.title}" has been restored`);
    } catch (error) {
      console.error("Error restoring book:", error);
      toast.error("Failed to restore book");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] bg-zinc-900 border-zinc-800 text-white overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <span className="bg-red-600/20 p-2 rounded-full mr-3">
              <ArrowUpFromLine className="h-5 w-5 text-red-500" />
            </span>
            Trash Bin
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Books in the trash bin will be permanently deleted after 30 days. Restore any books you want to keep.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col flex-grow mt-4 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
            </div>
          ) : deletedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-zinc-800/50 rounded-lg p-8 h-64 text-center">
              <div className="bg-zinc-800 p-4 rounded-full mb-4">
                <ArrowUpFromLine className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="font-medium text-lg text-white mb-1">Trash bin is empty</h3>
              <p className="text-zinc-400 text-sm max-w-sm">
                When you delete books, they'll appear here for 30 days before being permanently removed.
              </p>
            </div>
          ) : (
            <div className="flex-grow overflow-auto pr-2 -mr-2">
              <Table>
                <TableHeader className="bg-zinc-800/50">
                  <TableRow className="hover:bg-zinc-800/80 border-zinc-800">
                    <TableHead className="text-zinc-400 w-[40%]">Book</TableHead>
                    <TableHead className="text-zinc-400">Details</TableHead>
                    <TableHead className="text-zinc-400 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedBooks.map((book) => {
                    // Calculate days remaining before permanent deletion
                    const deletedDate = book.deletedAt ? new Date(book.deletedAt) : new Date();
                    const today = new Date();
                    const daysDeleted = Math.floor((today.getTime() - deletedDate.getTime()) / (1000 * 3600 * 24));
                    const daysRemaining = 30 - daysDeleted;
                    
                    return (
                      <TableRow 
                        key={book.id} 
                        className={cn(
                          "border-zinc-800/50 hover:bg-zinc-800/30", 
                          restoringId === book.id && "opacity-50"
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{book.title}</span>
                            <span className="text-zinc-500 text-sm truncate max-w-[250px]">
                              {book.description || "No description"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-zinc-400 flex flex-wrap gap-2 mb-1">
                              <span className="text-xs bg-zinc-800 rounded-full px-2 py-0.5">
                                {book.genre || "Fiction"}
                              </span>
                              <span className="text-xs bg-zinc-800 rounded-full px-2 py-0.5">
                                Deleted {daysDeleted} days ago
                              </span>
                            </span>
                            <span className="text-xs text-red-400">
                              Will be permanently deleted in {daysRemaining} days
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-zinc-800 hover:bg-zinc-700 text-white"
                            onClick={() => handleRestoreBook(book)}
                            disabled={restoringId === book.id}
                          >
                            {restoringId === book.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <ArrowUpFromLine className="h-4 w-4 mr-2" />
                            )}
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
