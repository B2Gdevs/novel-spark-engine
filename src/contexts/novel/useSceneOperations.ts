import { v4 as uuidv4 } from "uuid";
import { Scene, NovelProject } from "@/types/novel";

export function useSceneOperations(project: NovelProject, setProject: React.Dispatch<React.SetStateAction<NovelProject>>) {
  const addScene = (scene: Omit<Scene, "id">): string | undefined => {
    if (!project.currentBookId) return undefined;
    
    const newId = uuidv4();
    const newScene = { 
      ...scene, 
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString() 
    };

    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            scenes: [...book.scenes, newScene]
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

  const updateScene = (id: string, scene: Partial<Scene>) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            scenes: book.scenes.map((s) => 
              s.id === id ? {
                ...s,
                ...scene,
                updatedAt: new Date().toISOString()
              } : s
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

  const deleteScene = (id: string) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            scenes: book.scenes.filter((s) => s.id !== id)
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

  const getScene = (id: string): Scene | undefined => {
    if (!project.currentBookId) return undefined;
    const currentBook = project.books.find(book => book.id === project.currentBookId);
    return currentBook?.scenes.find((s) => s.id === id);
  };

  return {
    addScene,
    updateScene,
    deleteScene,
    getScene
  };
}
