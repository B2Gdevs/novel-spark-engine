import { v4 as uuidv4 } from "uuid";
import { Page, NovelProject } from "@/types/novel";

export function usePageOperations(project: NovelProject, setProject: React.Dispatch<React.SetStateAction<NovelProject>>) {
  const addPage = (page: Omit<Page, "id">): string | undefined => {
    if (!project.currentBookId) return undefined;
    
    const newId = uuidv4();
    const newPage = { 
      ...page, 
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            pages: [...book.pages, newPage]
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

  const updatePage = (id: string, page: Partial<Page>) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            pages: book.pages.map((p) => 
              p.id === id ? {
                ...p,
                ...page,
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

  const deletePage = (id: string) => {
    if (!project.currentBookId) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            pages: book.pages.filter((p) => p.id !== id)
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

  const getPage = (id: string): Page | undefined => {
    if (!project.currentBookId) return undefined;
    const currentBook = project.books.find(book => book.id === project.currentBookId);
    return currentBook?.pages.find((p) => p.id === id);
  };

  return {
    addPage,
    updatePage,
    deletePage,
    getPage
  };
}
