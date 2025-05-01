
import { useContext, ReactNode, useEffect } from "react";
import { NovelContextType } from "./types";
import { useBookOperations } from "./useBookOperations";
import { useCharacterOperations } from "./useCharacterOperations";
import { useSceneOperations } from "./useSceneOperations";
import { useEventOperations } from "./useEventOperations";
import { usePageOperations } from "./usePageOperations";
import { useNoteOperations } from "./useNoteOperations";
import { usePlaceOperations } from "./usePlaceOperations";
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
  const { addPlace, updatePlace, deletePlace, getPlace } = usePlaceOperations(project, setProject);
  const { addNote, updateNote, deleteNote, getNote } = useNoteOperations(project, setProject);
  const { 
    addChatMessage, 
    clearChatHistory, 
    sendMessageToAI,
    associateChatWithEntity,
    rollbackEntity
  } = useChatOperations(setProject);
  const { saveProject, loadProject } = useStorage(project, setProject);

  // Log the current state for debugging
  useEffect(() => {
    console.log("NovelProvider state:", { 
      currentBookId: project.currentBookId,
      currentBook: currentBook,
      booksCount: project.books.length 
    });
  }, [project, currentBook]);

  // Add a new function to find entities by partial name for the @ mentions
  const findEntitiesByPartialName = (
    partialName: string,
    entityTypes: Array<'character' | 'scene' | 'place' | 'page'>
  ) => {
    if (!currentBook || partialName.length < 2) return [];
    
    const results: Array<{
      type: 'character' | 'scene' | 'place' | 'page';
      id: string;
      name: string;
      description?: string;
    }> = [];
    
    const normalizedPartial = partialName.toLowerCase();
    
    if (entityTypes.includes('character')) {
      const matchingCharacters = currentBook.characters.filter(
        char => char.name.toLowerCase().includes(normalizedPartial)
      );
      
      results.push(
        ...matchingCharacters.map(char => ({
          type: 'character' as const,
          id: char.id,
          name: char.name,
          description: char.description
        }))
      );
    }
    
    if (entityTypes.includes('scene')) {
      const matchingScenes = currentBook.scenes.filter(
        scene => scene.title.toLowerCase().includes(normalizedPartial)
      );
      
      results.push(
        ...matchingScenes.map(scene => ({
          type: 'scene' as const,
          id: scene.id,
          name: scene.title,
          description: scene.description
        }))
      );
    }
    
    if (entityTypes.includes('page')) {
      const matchingPages = currentBook.pages.filter(
        page => page.title.toLowerCase().includes(normalizedPartial)
      );
      
      results.push(
        ...matchingPages.map(page => ({
          type: 'page' as const,
          id: page.id,
          name: page.title,
          description: page.content.substring(0, 100) + (page.content.length > 100 ? '...' : '')
        }))
      );
    }
    
    if (entityTypes.includes('place') && currentBook.places) {
      const matchingPlaces = currentBook.places.filter(
        place => place.name.toLowerCase().includes(normalizedPartial)
      );
      
      results.push(
        ...matchingPlaces.map(place => ({
          type: 'place' as const,
          id: place.id,
          name: place.name,
          description: place.description
        }))
      );
    }
    
    // Return top 5 matches
    return results.slice(0, 5);
  };
  
  // Add a function to get entity info by type and id
  const getEntityInfo = (entityType: string, entityId: string) => {
    switch(entityType) {
      case 'character':
        return getCharacter(entityId);
      case 'scene':
        return getScene(entityId);
      case 'page':
        return getPage(entityId);
      case 'place':
        return getPlace(entityId);
      case 'note':
        return getNote(entityId);
      case 'event':
        return getEvent(entityId);
      default:
        return null;
    }
  };

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
    addPlace,
    updatePlace,
    deletePlace,
    getPlace,
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
    associateChatWithEntity,
    rollbackEntity,
    findEntitiesByPartialName,
    getEntityInfo
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
