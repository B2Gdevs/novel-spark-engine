import { v4 as uuidv4 } from "uuid";
import { Character, NovelProject } from "@/types/novel";

export function useCharacterOperations(project: NovelProject, setProject: React.Dispatch<React.SetStateAction<NovelProject>>) {
  const addCharacter = (character: Omit<Character, "id">) => {
    if (!project.currentBookId) return undefined;
    
    const newId = uuidv4();
    const newCharacter = { 
      ...character, 
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            characters: [...book.characters, newCharacter]
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

  const updateCharacter = (id: string, character: Partial<Character>) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            characters: book.characters.map((c) => 
              c.id === id ? { 
                ...c, 
                ...character,
                updatedAt: new Date().toISOString() 
              } : c
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

  const deleteCharacter = (id: string) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            characters: book.characters.filter((c) => c.id !== id)
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

  const getCharacter = (id: string): Character | undefined => {
    if (!project.currentBookId) return undefined;
    const currentBook = project.books.find(book => book.id === project.currentBookId);
    return currentBook?.characters.find((c) => c.id === id);
  };

  return {
    addCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacter
  };
}
