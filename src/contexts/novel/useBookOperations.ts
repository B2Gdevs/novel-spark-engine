
import { NovelProject, Book } from "@/types/novel";
import { useCurrentBook } from "./useCurrentBook";
import { useBookCRUD } from "./useBookCRUD";
import { useBookNavigation } from "./useBookNavigation";

export function useBookOperations(
  project: NovelProject, 
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>
) {
  const currentBook = useCurrentBook(project);
  const { addBook, deleteBook } = useBookCRUD(project, setProject);
  const { switchBook, getLastModifiedItem } = useBookNavigation(project, setProject);

  const getAllBooks = (): Book[] => {
    return project.books;
  };
  
  return {
    currentBook,
    addBook,
    deleteBook,
    switchBook,
    getLastModifiedItem,
    getAllBooks
  };
}
