
import { useContext, ReactNode, useEffect } from "react";
import { NovelContextType } from "./types";
import { useBookOperations } from "./useBookOperations";
import { useCharacterOperations } from "./useCharacterOperations";
import { useSceneOperations } from "./useSceneOperations";
import { useEventOperations } from "./useEventOperations";
import { usePageOperations } from "./usePageOperations";
import { useNoteOperations } from "./useNoteOperations";
import { useChatOperations } from "./useChatOperations";
import { useStorage } from "./useStorage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NovelContext from "./NovelContext";
import { useProjectState } from "./useProjectState";

export function NovelProvider({ children }: { children: ReactNode }) {
  const { project, setProject } = useProjectState();

  // Fetch books from Supabase on initialization
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setProject(prev => {
            const transformedBooks = data.map(dbBook => {
              // Find if we already have this book in local state to preserve its entities
              const existingBook = prev.books.find(book => book.id === dbBook.id);
              
              return {
                id: dbBook.id,
                title: dbBook.title,
                description: dbBook.description || "",
                genre: dbBook.genre || "Fiction",
                characters: existingBook?.characters || [],
                scenes: existingBook?.scenes || [],
                events: existingBook?.events || [],
                notes: existingBook?.notes || [],
                pages: existingBook?.pages || [],
                createdAt: dbBook.created_at,
                updatedAt: dbBook.updated_at
              };
            });
            
            return {
              ...prev,
              books: transformedBooks,
              // If we previously had a currentBookId but it's no longer in the books array
              // then set currentBookId to null
              currentBookId: transformedBooks.some(book => book.id === prev.currentBookId) 
                ? prev.currentBookId 
                : null
            };
          });
        }
      } catch (error) {
        console.error("Error fetching books from Supabase:", error);
        toast.error("Failed to load books from database");
      }
    };
    
    fetchBooks();
  }, [setProject]);

  // Get all operations
  const { currentBook, addBook, deleteBook, switchBook, getLastModifiedItem } = useBookOperations(project, setProject);
  const { addCharacter, updateCharacter, deleteCharacter, getCharacter } = useCharacterOperations(project, setProject);
  const { addScene, updateScene, deleteScene, getScene } = useSceneOperations(project, setProject);
  const { addEvent, updateEvent, deleteEvent, getEvent } = useEventOperations(project, setProject);
  const { addPage, updatePage, deletePage, getPage } = usePageOperations(project, setProject);
  const { addNote, updateNote, deleteNote, getNote } = useNoteOperations(project, setProject);
  const { addChatMessage, clearChatHistory, sendMessageToAI } = useChatOperations(setProject);
  const { saveProject, loadProject } = useStorage(project, setProject);

  // Log the current state for debugging
  useEffect(() => {
    console.log("NovelProvider state:", { 
      currentBookId: project.currentBookId,
      currentBook: currentBook,
      booksCount: project.books.length 
    });
  }, [project, currentBook]);

  const contextValue: NovelContextType = {
    project,
    currentBook,
    addBook,
    deleteBook,
    switchBook,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacter,
    addPage,
    updatePage,
    deletePage,
    getPage,
    addScene,
    updateScene,
    deleteScene,
    getScene,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    addNote,
    updateNote,
    deleteNote,
    getNote,
    addChatMessage,
    clearChatHistory,
    sendMessageToAI,
    saveProject,
    loadProject,
    getLastModifiedItem,
    setProject,
  };

  return (
    <NovelContext.Provider value={contextValue}>
      {children}
    </NovelContext.Provider>
  );
}

export const useNovel = () => {
  const context = useContext(NovelContext);
  if (context === undefined) {
    throw new Error("useNovel must be used within a NovelProvider");
  }
  return context;
};
