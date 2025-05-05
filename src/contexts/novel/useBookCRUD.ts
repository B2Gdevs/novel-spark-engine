import { v4 as uuidv4 } from 'uuid';
import { NovelProject, Book } from '@/types/novel';
import { toast } from 'sonner';

export function useBookCRUD(
  project: NovelProject, 
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>
) {
  const addBook = async (bookData: Omit<Book, "id">): Promise<void> => {
    const newId = uuidv4();
    const newBook: Book = {
      id: newId,
      ...bookData
    };
    
    setProject(prev => {
      return {
        ...prev,
        books: [...prev.books, newBook],
        currentBookId: newId
      };
    });

    toast.success(`Book "${bookData.title}" created`);
  };
  
  const deleteBook = async (id: string): Promise<void> => {
    setProject(prev => {
      const timestamp = new Date().toISOString();
      
      // Mark the book as deleted but keep it in the array
      const updatedBooks = prev.books.map(book => 
        book.id === id 
          ? { ...book, isDeleted: true, deletedAt: timestamp } 
          : book
      );
      
      // If we're deleting the current book, set currentBookId to null
      const newCurrentBookId = prev.currentBookId === id ? null : prev.currentBookId;
      
      return {
        ...prev,
        books: updatedBooks,
        currentBookId: newCurrentBookId
      };
    });
  };
  
  return {
    addBook,
    deleteBook
  };
}
