import { ReactNode, useEffect } from "react";
import { NovelContextType } from "../types";
import { useBookOperations } from "../useBookOperations";
import { useCharacterOperations } from "../useCharacterOperations";
import { useSceneOperations } from "../useSceneOperations";
import { useEventOperations } from "../useEventOperations";
import { usePageOperations } from "../usePageOperations";
import { useNoteOperations } from "../useNoteOperations";
import { usePlaceOperations } from "../usePlaceOperations";
import { useChatOperations } from "../useChatOperations";
import { useStorage } from "../useStorage";
import NovelContext from "../NovelContext";
import { useProjectState } from "../useProjectState";
import { EntitySearchProvider } from "./EntitySearchProvider";
import { useSummaryOperations } from "../useSummaryOperations";
import { useVersionOperations } from "../useVersionOperations";

export function NovelProviderCore({ children }: { children: ReactNode }) {
  const { project, setProject } = useProjectState();

  // Get version operations first so we can pass them to other hooks
  const { 
    addEntityVersion, 
    getEntityVersions, 
    restoreEntityVersion, 
    createChatCheckpoint,
    restoreChatCheckpoint,
    loadVersionsFromSupabase
  } = useVersionOperations(project, setProject);

  // Get all operations with version support
  const { currentBook, addBook, deleteBook, switchBook, getLastModifiedItem, getAllBooks } = useBookOperations(project, setProject);
  const { addCharacter, updateCharacter, deleteCharacter, getCharacter } = useCharacterOperations(project, setProject, addEntityVersion);
  const { addScene, updateScene, deleteScene, getScene } = useSceneOperations(project, setProject, addEntityVersion);
  const { addEvent, updateEvent, deleteEvent, getEvent } = useEventOperations(project, setProject, addEntityVersion);
  const { addPage, updatePage, deletePage, getPage } = usePageOperations(project, setProject, addEntityVersion);
  const { addPlace, updatePlace, deletePlace, getPlace } = usePlaceOperations(project, setProject, addEntityVersion);
  const { addNote, updateNote, deleteNote, getNote } = useNoteOperations(project, setProject, addEntityVersion);
  const { 
    addChatMessage, 
    clearChatHistory, 
    sendMessageToAI,
    associateChatWithEntity,
    rollbackEntity
  } = useChatOperations(project, setProject); 
  const { saveProject, loadProject } = useStorage(project, setProject);
  const { generateBookSummary } = useSummaryOperations(project, setProject, sendMessageToAI);

  // Load versions when current book changes
  useEffect(() => {
    if (project.currentBookId) {
      loadVersionsFromSupabase(project.currentBookId).catch(err => 
        console.error("Failed to load entity versions:", err)
      );
    }
  }, [project.currentBookId, loadVersionsFromSupabase]);

  // Log the current state for debugging
  useEffect(() => {
    console.log("NovelProvider state:", { 
      currentBookId: project.currentBookId,
      currentBook: currentBook,
      booksCount: project.books.length,
      versionCount: project.entityVersions?.length || 0
    });
  }, [project, currentBook]);

  // Enhanced function to find entities by partial name with fuzzy matching
  const findEntitiesByPartialName = (
    partialName: string,
    entityTypes: Array<'character' | 'scene' | 'place' | 'page'>,
    includeAllBooks: boolean = false
  ) => {
    if (partialName.length < 1) return [];
    
    const results: Array<{
      type: 'character' | 'scene' | 'place' | 'page';
      id: string;
      name: string;
      description?: string;
      bookId?: string;
      bookTitle?: string;
    }> = [];
    
    const normalizedPartial = partialName.toLowerCase();
    
    // Function to check if a string matches our fuzzy search criteria
    const fuzzyMatch = (str: string, query: string): boolean => {
      str = str.toLowerCase();
      query = query.toLowerCase();
      
      // Direct includes match
      if (str.includes(query)) return true;
      
      // Fuzzy match - all characters appear in order
      let strIndex = 0;
      for (let i = 0; i < query.length; i++) {
        const char = query[i];
        let found = false;
        
        while (strIndex < str.length) {
          if (str[strIndex] === char) {
            found = true;
            strIndex++;
            break;
          }
          strIndex++;
        }
        
        if (!found) return false;
      }
      
      return true;
    };
    
    // Books to search through
    const books = includeAllBooks ? project.books : (currentBook ? [currentBook] : []);
    
    books.forEach(book => {
      if (entityTypes.includes('character')) {
        const matchingCharacters = book.characters.filter(
          char => fuzzyMatch(char.name, normalizedPartial)
        );
        
        results.push(
          ...matchingCharacters.map(char => ({
            type: 'character' as const,
            id: char.id,
            name: char.name,
            description: char.description,
            bookId: book.id,
            bookTitle: book.title
          }))
        );
      }
      
      if (entityTypes.includes('scene')) {
        const matchingScenes = book.scenes.filter(
          scene => fuzzyMatch(scene.title, normalizedPartial)
        );
        
        results.push(
          ...matchingScenes.map(scene => ({
            type: 'scene' as const,
            id: scene.id,
            name: scene.title,
            description: scene.description,
            bookId: book.id,
            bookTitle: book.title
          }))
        );
      }
      
      if (entityTypes.includes('page')) {
        const matchingPages = book.pages.filter(
          page => fuzzyMatch(page.title, normalizedPartial)
        );
        
        results.push(
          ...matchingPages.map(page => ({
            type: 'page' as const,
            id: page.id,
            name: page.title,
            description: page.content?.substring(0, 100) + (page.content && page.content.length > 100 ? '...' : ''),
            bookId: book.id,
            bookTitle: book.title
          }))
        );
      }
      
      if (entityTypes.includes('place') && book.places) {
        const matchingPlaces = book.places.filter(
          place => fuzzyMatch(place.name, normalizedPartial)
        );
        
        results.push(
          ...matchingPlaces.map(place => ({
            type: 'place' as const,
            id: place.id,
            name: place.name,
            description: place.description,
            bookId: book.id,
            bookTitle: book.title
          }))
        );
      }
    });
    
    // Sort results by relevance - exact matches first, then starting with, then containing
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact matches first
      if (aName === normalizedPartial && bName !== normalizedPartial) return -1;
      if (bName === normalizedPartial && aName !== normalizedPartial) return 1;
      
      // Then starting with
      if (aName.startsWith(normalizedPartial) && !bName.startsWith(normalizedPartial)) return -1;
      if (bName.startsWith(normalizedPartial) && !aName.startsWith(normalizedPartial)) return 1;
      
      // Then alphabetical
      return aName.localeCompare(bName);
    });
    
    // Return top 10 matches
    return results.slice(0, 10);
  };
  
  // Enhanced function to get entity info by type and id, with optional bookId
  const getEntityInfo = (entityType: string, entityId: string, bookId?: string) => {
    // If no specific book is provided, use the current book
    const bookToUse = bookId ? project.books.find(b => b.id === bookId) : currentBook;
    if (!bookToUse) return null;
    
    switch(entityType) {
      case 'character': {
        const character = bookToUse.characters.find(c => c.id === entityId);
        if (character) {
          return { ...character, bookId: bookToUse.id, bookTitle: bookToUse.title };
        }
        break;
      }
      case 'scene': {
        const scene = bookToUse.scenes.find(s => s.id === entityId);
        if (scene) {
          return { ...scene, bookId: bookToUse.id, bookTitle: bookToUse.title };
        }
        break;
      }
      case 'page': {
        const page = bookToUse.pages.find(p => p.id === entityId);
        if (page) {
          return { ...page, bookId: bookToUse.id, bookTitle: bookToUse.title };
        }
        break;
      }
      case 'place': {
        if (bookToUse.places) {
          const place = bookToUse.places.find(p => p.id === entityId);
          if (place) {
            return { ...place, bookId: bookToUse.id, bookTitle: bookToUse.title };
          }
        }
        break;
      }
      case 'note': {
        const note = bookToUse.notes.find(n => n.id === entityId);
        if (note) {
          return { ...note, bookId: bookToUse.id, bookTitle: bookToUse.title };
        }
        break;
      }
      case 'event': {
        const event = bookToUse.events.find(e => e.id === entityId);
        if (event) {
          return { ...event, bookId: bookToUse.id, bookTitle: bookToUse.title };
        }
        break;
      }
    }
    
    // If not found in the specified book, search all books if specified
    if (!bookId) {
      for (const book of project.books) {
        if (book.id === bookToUse.id) continue; // Skip the book we already checked
        
        const result = getEntityInfo(entityType, entityId, book.id);
        if (result) return result;
      }
    }
    
    return null;
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
    getEntityInfo,
    getAllBooks,
    generateBookSummary,
    
    // Version management
    addEntityVersion,
    getEntityVersions,
    restoreEntityVersion,
    createChatCheckpoint,
    restoreChatCheckpoint,
    loadVersionsFromSupabase
  };

  return (
    <NovelContext.Provider value={contextValue}>
      <EntitySearchProvider 
        currentBook={currentBook}
        findEntitiesByPartialName={findEntitiesByPartialName}
        getEntityInfo={getEntityInfo}
      >
        {children}
      </EntitySearchProvider>
    </NovelContext.Provider>
  );
}
