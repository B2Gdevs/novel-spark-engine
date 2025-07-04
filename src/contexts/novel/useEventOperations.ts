
import { v4 as uuidv4 } from "uuid";
import { Event, NovelProject } from "@/types/novel";

export function useEventOperations(
  project: NovelProject, 
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>,
  addEntityVersion?: (
    entityType: 'character' | 'scene' | 'page' | 'place' | 'event',
    entityId: string,
    entityData: any,
    messageId?: string,
    description?: string
  ) => string | undefined
) {
  const addEvent = (event: Omit<Event, "id">, messageId?: string): string | undefined => {
    if (!project.currentBookId) return undefined;
    
    const newId = uuidv4();
    const newEvent = { 
      ...event, 
      id: newId,
      date: event.date || "Unknown",
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
    
    // Create initial version
    if (addEntityVersion) {
      addEntityVersion('event', newId, newEvent, messageId, `Created event ${event.name}`);
    }
    
    return newId; // Return the new ID
  };

  const updateEvent = (id: string, event: Partial<Event>, messageId?: string) => {
    if (!project.currentBookId) return;
    
    let updatedEvent: Event | undefined;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          const events = book.events.map((e) => {
            if (e.id === id) {
              updatedEvent = {
                ...e,
                ...event,
                updatedAt: new Date().toISOString()
              };
              return updatedEvent;
            }
            return e;
          });
          
          return {
            ...book,
            events
          };
        }
        return book;
      });
      
      return {
        ...prev,
        books: updatedBooks
      };
    });
    
    // Create version for the update
    if (addEntityVersion && updatedEvent) {
      addEntityVersion(
        'event', 
        id, 
        updatedEvent, 
        messageId, 
        `Updated event ${updatedEvent.name}`
      );
    }
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

  const getAllEventsSorted = (): Event[] => {
    if (!project.currentBookId) return [];
    const currentBook = project.books.find(book => book.id === project.currentBookId);
    if (!currentBook) return [];
    
    // Sort by date if available
    return [...currentBook.events].sort((a, b) => {
      // Try to parse dates if they exist, otherwise use alphabetical sorting
      if (a.date && b.date) {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // If both are valid dates, compare them
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA.getTime() - dateB.getTime();
        }
      }
      
      // Fallback to name comparison
      return a.name.localeCompare(b.name);
    });
  };

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getAllEventsSorted
  };
}
