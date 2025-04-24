import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Book, NovelProject } from "@/types/novel";

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
    const newCharacter = { ...character, id: uuidv4() };
    setProject((prev) => ({
      ...prev,
      characters: [...prev.characters, newCharacter]
    }));
  };

  const updateCharacter = (id: string, character: Partial<Character>) => {
    setProject((prev) => ({
      ...prev,
      characters: prev.characters.map((c) => 
        c.id === id ? { ...c, ...character } : c
      )
    }));
  };

  const deleteCharacter = (id: string) => {
    setProject((prev) => ({
      ...prev,
      characters: prev.characters.filter((c) => c.id !== id)
    }));
  };

  const getCharacter = (id: string) => {
    return project.characters.find((c) => c.id === id);
  };

  const addScene = (scene: Omit<Scene, "id">) => {
    const newScene = { ...scene, id: uuidv4() };
    setProject((prev) => ({
      ...prev,
      scenes: [...prev.scenes, newScene]
    }));
  };

  const updateScene = (id: string, scene: Partial<Scene>) => {
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => 
        s.id === id ? { ...s, ...scene } : s
      )
    }));
  };

  const deleteScene = (id: string) => {
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.filter((s) => s.id !== id)
    }));
  };

  const getScene = (id: string) => {
    return project.scenes.find((s) => s.id === id);
  };

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent = { ...event, id: uuidv4() };
    setProject((prev) => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };

  const updateEvent = (id: string, event: Partial<Event>) => {
    setProject((prev) => ({
      ...prev,
      events: prev.events.map((e) => 
        e.id === id ? { ...e, ...event } : e
      )
    }));
  };

  const deleteEvent = (id: string) => {
    setProject((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id)
    }));
  };

  const getEvent = (id: string) => {
    return project.events.find((e) => e.id === id);
  };

  const addNote = (note: Omit<Note, "id">) => {
    const newNote = { ...note, id: uuidv4() };
    setProject((prev) => ({
      ...prev,
      notes: [...prev.notes, newNote]
    }));
  };

  const updateNote = (id: string, note: Partial<Note>) => {
    setProject((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => 
        n.id === id ? { ...n, ...note } : n
      )
    }));
  };

  const deleteNote = (id: string) => {
    setProject((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id)
    }));
  };

  const getNote = (id: string) => {
    return project.notes.find((n) => n.id === id);
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
