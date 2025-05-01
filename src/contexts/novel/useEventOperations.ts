
import { v4 as uuidv4 } from "uuid";
import { Event, NovelProject } from "@/types/novel";

export function useEventOperations(project: NovelProject, setProject: React.Dispatch<React.SetStateAction<NovelProject>>) {
  const addEvent = (event: Omit<Event, "id">) => {
    if (!project.currentBookId) return;
    
    const newEvent = { 
      ...event, 
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            events: [...book.events, newEvent]
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

  const updateEvent = (id: string, event: Partial<Event>) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            events: book.events.map((e) => 
              e.id === id ? {
                ...e,
                ...event,
                updatedAt: new Date().toISOString()
              } : e
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

  const deleteEvent = (id: string) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            events: book.events.filter((e) => e.id !== id)
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

  const getEvent = (id: string): Event | undefined => {
    if (!project.currentBookId) return undefined;
    const currentBook = project.books.find(book => book.id === project.currentBookId);
    return currentBook?.events.find((e) => e.id === id);
  };

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent
  };
}
