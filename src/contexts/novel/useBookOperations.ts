
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Book, NovelProject } from "@/types/novel";

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

  const addBook = (book: Omit<Book, "id">) => {
    const newBook = { 
      ...book, 
      id: uuidv4(),
      characters: Array.isArray(book.characters) ? book.characters : [],
      scenes: Array.isArray(book.scenes) ? book.scenes : [],
      events: Array.isArray(book.events) ? book.events : [],
      notes: Array.isArray(book.notes) ? book.notes : [],
      pages: Array.isArray(book.pages) ? book.pages : []
    };
    setProject(prev => ({
      ...prev,
      books: [...prev.books, newBook],
      currentBookId: newBook.id
    }));
    toast.success("New book created");
  };

  const deleteBook = (id: string) => {
    setProject(prev => {
      // Don't delete if it's the only book
      if (prev.books.length === 1) {
        toast.error("Cannot delete the only book");
        return prev;
      }
      
      // Find index to select another book
      const bookIndex = prev.books.findIndex(book => book.id === id);
      const newIndex = bookIndex === 0 ? 1 : bookIndex - 1;
      const newCurrentBookId = prev.books[newIndex]?.id || null;
      
      return {
        ...prev,
        books: prev.books.filter(book => book.id !== id),
        currentBookId: prev.currentBookId === id ? newCurrentBookId : prev.currentBookId
      };
    });
    
    toast.success("Book deleted");
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
