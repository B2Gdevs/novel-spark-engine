
import { useState, useEffect } from "react";
import { Book, NovelProject } from "@/types/novel";

export function useCurrentBook(project: NovelProject) {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  
  // Update currentBook whenever project changes
  useEffect(() => {
    // Clear current book when on home page or when the current book doesn't exist
    const book = project.currentBookId 
      ? project.books.find(book => book.id === project.currentBookId) || null
      : null;
      
    setCurrentBook(book);
    
    // Log for debugging
    console.log("useCurrentBook updated:", {
      currentBookId: project.currentBookId,
      foundBook: !!book,
      bookTitle: book?.title
    });
  }, [project.currentBookId, project.books]);

  return currentBook;
}
