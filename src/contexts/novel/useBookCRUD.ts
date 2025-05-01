
import { toast } from "sonner";
import { Book, NovelProject } from "@/types/novel";
import { supabase } from "@/integrations/supabase/client";

export function useBookCRUD(
  project: NovelProject,
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>
) {
  const addBook = async (book: Omit<Book, "id">) => {
    try {
      // Insert the book into Supabase
      const { data: newDbBook, error } = await supabase
        .from('books')
        .insert([
          {
            title: book.title,
            description: book.description,
            genre: book.genre || "Fiction"
          }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Create a new book with both Supabase data and local data
      const newBook = { 
        id: newDbBook.id,
        title: newDbBook.title,
        description: newDbBook.description || "",
        genre: newDbBook.genre || "Fiction",
        characters: Array.isArray(book.characters) ? book.characters : [],
        scenes: Array.isArray(book.scenes) ? book.scenes : [],
        events: Array.isArray(book.events) ? book.events : [],
        notes: Array.isArray(book.notes) ? book.notes : [],
        pages: Array.isArray(book.pages) ? book.pages : [],
        createdAt: newDbBook.created_at,
        updatedAt: newDbBook.updated_at
      };
      
      // Update local state
      setProject(prev => ({
        ...prev,
        books: [...prev.books, newBook],
        currentBookId: newBook.id
      }));
      
      toast.success("New book created");
      return newBook;
    } catch (error) {
      console.error("Error creating book:", error);
      toast.error("Failed to create book");
      throw error;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      // Soft delete the book in Supabase
      const { error } = await supabase
        .from('books')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setProject(prev => {
        // Find index to select another book
        const bookIndex = prev.books.findIndex(book => book.id === id);
        const newIndex = bookIndex === 0 ? 1 : bookIndex - 1;
        const newCurrentBookId = prev.books.length > 1 ? prev.books[newIndex]?.id || null : null;
        
        return {
          ...prev,
          books: prev.books.filter(book => book.id !== id),
          currentBookId: prev.currentBookId === id ? newCurrentBookId : prev.currentBookId
        };
      });
      
      toast.success("Book moved to trash");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    }
  };

  return {
    addBook,
    deleteBook
  };
}
