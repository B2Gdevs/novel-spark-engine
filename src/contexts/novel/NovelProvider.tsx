import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { NovelContextType } from "./types";
import { useBookOperations } from "./useBookOperations";
import { useCharacterOperations } from "./useCharacterOperations";
import { useSceneOperations } from "./useSceneOperations";
import { useEventOperations } from "./useEventOperations";
import { usePageOperations } from "./usePageOperations";
import { useNoteOperations } from "./useNoteOperations";
import { useChatOperations } from "./useChatOperations";
import { useStorage } from "./useStorage";
import { NovelProject } from "@/types/novel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const defaultProject: NovelProject = {
  books: [],
  currentBookId: null,
  chatHistory: []
};

const NovelContext = createContext<NovelContextType | undefined>(undefined);

export function NovelProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<NovelProject>(() => {
    try {
      const savedProject = localStorage.getItem("novelProject");
      if (savedProject) {
        const parsedProject = JSON.parse(savedProject);
        // Ensure the structure is valid
        return {
          books: Array.isArray(parsedProject.books) ? parsedProject.books.map((book: any) => ({
            ...book,
            pages: Array.isArray(book.pages) ? book.pages : []
          })) : [],
          currentBookId: parsedProject.currentBookId || null,
          chatHistory: Array.isArray(parsedProject.chatHistory) ? parsedProject.chatHistory : []
        };
      }
      return defaultProject;
    } catch (e) {
      console.error("Error loading project from localStorage:", e);
      return defaultProject;
    }
  });

  const [apiKey, setApiKey] = useState(() => {
    try {
      const savedKey = localStorage.getItem("openaiApiKey");
      return savedKey || "";
    } catch (e) {
      console.error("Error loading API key from localStorage:", e);
      return "";
    }
  });

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
            
            console.log("Books loaded from Supabase:", transformedBooks);
            
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
  }, []);

  const { 
    currentBook, 
    addBook, 
    deleteBook, 
    switchBook, 
    getLastModifiedItem 
  } = useBookOperations(project, setProject);
  
  const { 
    addCharacter, 
    updateCharacter, 
    deleteCharacter, 
    getCharacter 
  } = useCharacterOperations(project, setProject);
  
  const { 
    addScene, 
    updateScene, 
    deleteScene, 
    getScene 
  } = useSceneOperations(project, setProject);
  
  const { 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    getEvent 
  } = useEventOperations(project, setProject);
  
  const { 
    addPage, 
    updatePage, 
    deletePage, 
    getPage 
  } = usePageOperations(project, setProject);
  
  const { 
    addNote, 
    updateNote, 
    deleteNote, 
    getNote 
  } = useNoteOperations(project, setProject);
  
  const { 
    addChatMessage, 
    clearChatHistory 
  } = useChatOperations(setProject);
  
  const { 
    saveProject, 
    loadProject 
  } = useStorage(project, setProject, apiKey, setApiKey);

  useEffect(() => {
    try {
      localStorage.setItem("openaiApiKey", apiKey);
    } catch (e) {
      console.error("Error saving API key to localStorage:", e);
    }
  }, [apiKey]);

  useEffect(() => {
    try {
      localStorage.setItem("novelProject", JSON.stringify(project));
    } catch (e) {
      console.error("Error saving project to localStorage:", e);
    }
  }, [project]);

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
    apiKey,
    setApiKey,
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
    saveProject,
    loadProject,
    getLastModifiedItem,
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
