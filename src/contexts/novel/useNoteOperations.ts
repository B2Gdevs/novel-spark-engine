
import { v4 as uuidv4 } from "uuid";
import { Note, NovelProject } from "@/types/novel";

export function useNoteOperations(project: NovelProject, setProject: React.Dispatch<React.SetStateAction<NovelProject>>) {
  const addNote = (note: Omit<Note, "id">) => {
    if (!project.currentBookId) return;
    
    const newNote = { 
      ...note, 
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            notes: [...book.notes, newNote]
          };
        }
        return book;
      });
      
      return {
        ...prev,
        books: updatedBooks
      };
    });
  };

  const updateNote = (id: string, note: Partial<Note>) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            notes: book.notes.map((n) => 
              n.id === id ? {
                ...n,
                ...note,
                updatedAt: new Date().toISOString()
              } : n
            )
          };
        }
        return book;
      });
      
      return {
        ...prev,
        books: updatedBooks
      };
    });
  };

  const deleteNote = (id: string) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            notes: book.notes.filter((n) => n.id !== id)
          };
        }
        return book;
      });
      
      return {
        ...prev,
        books: updatedBooks
      };
    });
  };

  const getNote = (id: string): Note | undefined => {
    if (!project.currentBookId) return undefined;
    const currentBook = project.books.find(book => book.id === project.currentBookId);
    return currentBook?.notes.find((n) => n.id === id);
  };

  return {
    addNote,
    updateNote,
    deleteNote,
    getNote
  };
}
