
import { v4 as uuidv4 } from "uuid";
import { Place, NovelProject } from "@/types/novel";

export function usePlaceOperations(project: NovelProject, setProject: React.Dispatch<React.SetStateAction<NovelProject>>) {
  const addPlace = (place: Omit<Place, "id">): string | undefined => {
    if (!project.currentBookId) return undefined;
    
    const newId = uuidv4();
    const newPlace = { 
      ...place, 
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString() 
    };

    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            places: [...(book.places || []), newPlace]
          };
        }
        return book;
      });
      
      return {
        ...prev,
        books: updatedBooks
      };
    });
    
    return newId; // Return the new ID
  };

  const updatePlace = (id: string, place: Partial<Place>) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId && book.places) {
          return {
            ...book,
            places: book.places.map((p) => 
              p.id === id ? {
                ...p,
                ...place,
                updatedAt: new Date().toISOString()
              } : p
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

  const deletePlace = (id: string) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId && book.places) {
          return {
            ...book,
            places: book.places.filter((p) => p.id !== id)
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

  const getPlace = (id: string): Place | undefined => {
    if (!project.currentBookId) return undefined;
    const currentBook = project.books.find(book => book.id === project.currentBookId);
    return currentBook?.places?.find((p) => p.id === id);
  };

  return {
    addPlace,
    updatePlace,
    deletePlace,
    getPlace
  };
}
