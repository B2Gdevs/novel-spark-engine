
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Book, NovelProject, Character, Scene, Event, Note, ChatMessage } from "@/types/novel";

const defaultProject: NovelProject = {
  books: [],
  currentBookId: null,
  chatHistory: []
};

const NovelContext = createContext<NovelContextType | undefined>(undefined);

interface NovelContextType {
  project: NovelProject;
  currentBook: Book | null;
  apiKey: string;
  setApiKey: (key: string) => void;
  addBook: (book: Omit<Book, "id">) => void;
  switchBook: (id: string) => void;
  addCharacter: (character: Omit<Character, "id">) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  getCharacter: (id: string) => Character | undefined;
  addScene: (scene: Omit<Scene, "id">) => void;
  updateScene: (id: string, scene: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  getScene: (id: string) => Scene | undefined;
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => Event | undefined;
  addNote: (note: Omit<Note, "id">) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChatHistory: () => void;
  saveProject: () => void;
  loadProject: (project: NovelProject) => void;
}

export function NovelProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<NovelProject>(() => {
    const savedProject = localStorage.getItem("novelProject");
    return savedProject ? JSON.parse(savedProject) : defaultProject;
  });

  const [apiKey, setApiKey] = useState(() => {
    const savedKey = localStorage.getItem("openaiApiKey");
    return savedKey || "";
  });

  const currentBook = project.currentBookId 
    ? project.books.find(book => book.id === project.currentBookId) || null
    : null;

  const addBook = (book: Omit<Book, "id">) => {
    const newBook = { ...book, id: uuidv4() };
    setProject(prev => ({
      ...prev,
      books: [...prev.books, newBook],
      currentBookId: newBook.id
    }));
    toast.success("New book created");
  };

  const switchBook = (id: string) => {
    setProject(prev => ({
      ...prev,
      currentBookId: id
    }));
    toast.success("Switched to different book");
  };

  const saveProject = () => {
    localStorage.setItem("novelProject", JSON.stringify(project));
    toast.success("Project saved successfully");
  };

  const loadProject = (loadedProject: NovelProject) => {
    setProject(loadedProject);
    localStorage.setItem("novelProject", JSON.stringify(loadedProject));
    toast.success("Project loaded successfully");
  };

  const addCharacter = (character: Omit<Character, "id">) => {
    if (!currentBook) return;
    
    const newCharacter = { ...character, id: uuidv4() };
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
  };

  const updateCharacter = (id: string, character: Partial<Character>) => {
    if (!currentBook) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            characters: book.characters.map((c) => 
              c.id === id ? { ...c, ...character } : c
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
    if (!currentBook) return;
    
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
    if (!currentBook) return undefined;
    return currentBook.characters.find((c) => c.id === id);
  };

  const addScene = (scene: Omit<Scene, "id">) => {
    if (!currentBook) return;
    
    const newScene = { ...scene, id: uuidv4() };
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
  };

  const updateScene = (id: string, scene: Partial<Scene>) => {
    if (!currentBook) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            scenes: book.scenes.map((s) => 
              s.id === id ? { ...s, ...scene } : s
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
    if (!currentBook) return;
    
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
    if (!currentBook) return undefined;
    return currentBook.scenes.find((s) => s.id === id);
  };

  const addEvent = (event: Omit<Event, "id">) => {
    if (!currentBook) return;
    
    const newEvent = { ...event, id: uuidv4() };
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
  };

  const updateEvent = (id: string, event: Partial<Event>) => {
    if (!currentBook) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            events: book.events.map((e) => 
              e.id === id ? { ...e, ...event } : e
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

  const deleteEvent = (id: string) => {
    if (!currentBook) return;
    
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
    if (!currentBook) return undefined;
    return currentBook.events.find((e) => e.id === id);
  };

  const addNote = (note: Omit<Note, "id">) => {
    if (!currentBook) return;
    
    const newNote = { ...note, id: uuidv4() };
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            notes: [...book.notes, newNote]
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

  const updateNote = (id: string, note: Partial<Note>) => {
    if (!currentBook) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            notes: book.notes.map((n) => 
              n.id === id ? { ...n, ...note } : n
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

  const deleteNote = (id: string) => {
    if (!currentBook) return;
    
    setProject((prev) => {
      const updatedBooks = prev.books.map(book => {
        if (book.id === prev.currentBookId) {
          return {
            ...book,
            notes: book.notes.filter((n) => n.id !== id)
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

  const getNote = (id: string): Note | undefined => {
    if (!currentBook) return undefined;
    return currentBook.notes.find((n) => n.id === id);
  };

  const addChatMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage = { 
      ...message, 
      id: uuidv4(),
      timestamp: Date.now()
    };
    setProject((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage]
    }));
  };

  const clearChatHistory = () => {
    setProject((prev) => ({
      ...prev,
      chatHistory: []
    }));
    toast.success("Chat history cleared");
  };

  useEffect(() => {
    localStorage.setItem("openaiApiKey", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("novelProject", JSON.stringify(project));
  }, [project]);

  return (
    <NovelContext.Provider
      value={{
        project,
        currentBook,
        apiKey,
        setApiKey,
        addBook,
        switchBook,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        getCharacter,
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
      }}
    >
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
