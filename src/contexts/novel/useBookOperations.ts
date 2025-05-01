
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Book, NovelProject } from "@/types/novel";
import { supabase } from "@/integrations/supabase/client";

export function useBookOperations(initialProject: NovelProject, setProject: React.Dispatch<React.SetStateAction<NovelProject>>) {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  
  // Update currentBook whenever initialProject changes
  useEffect(() => {
    // Clear current book when on home page or when the current book doesn't exist
    const book = initialProject.currentBookId 
      ? initialProject.books.find(book => book.id === initialProject.currentBookId) || null
      : null;
      
    setCurrentBook(book);
    
    // Log for debugging
    console.log("useBookOperations updated currentBook:", {
      currentBookId: initialProject.currentBookId,
      foundBook: !!book,
      bookTitle: book?.title
    });
  }, [initialProject]);

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
      // Don't delete if it's the only book
      if (initialProject.books.length === 1) {
        toast.error("Cannot delete the only book");
        return;
      }
      
      // Delete from Supabase
      const { error } = await supabase
        .from('books')
        .delete()
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
      
      toast.success("Book deleted");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    }
  };

  const switchBook = (id: string) => {
    setProject(prev => ({
      ...prev,
      currentBookId: id
    }));
    toast.success("Switched to different book");
  };

  const getLastModifiedItem = useCallback((bookId: string) => {
    const book = initialProject.books.find(b => b.id === bookId);
    if (!book) return null;
    
    const items = [
      ...book.scenes.map(s => ({ type: "scenes", id: s.id, date: s.updatedAt || s.createdAt || "" })),
      ...book.characters.map(c => ({ type: "characters", id: c.id, date: c.updatedAt || c.createdAt || "" })),
      ...book.events.map(e => ({ type: "events", id: e.id, date: e.updatedAt || e.createdAt || "" })),
      ...book.notes.map(n => ({ type: "notes", id: n.id, date: n.updatedAt || n.createdAt || "" })),
      ...book.pages.map(p => ({ type: "pages", id: p.id, date: p.updatedAt || p.createdAt || "" }))
    ];
    
    if (items.length === 0) return null;
    
    // Sort by date, most recent first
    items.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Return the most recent item
    return { type: items[0].type, id: items[0].id };
  }, [initialProject.books]);

  return {
    currentBook,
    addBook,
    deleteBook,
    switchBook,
    getLastModifiedItem
  };
}
