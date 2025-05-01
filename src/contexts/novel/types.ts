
import { Book, Character, Scene, Event, Note, ChatMessage, NovelProject, Page } from "@/types/novel";

export interface NovelContextType {
  project: NovelProject;
  currentBook: Book | null;
  addBook: (book: Omit<Book, "id">) => void;
  deleteBook: (id: string) => void;
  switchBook: (id: string) => void;
  addCharacter: (character: Omit<Character, "id">) => string | undefined; // Return new ID
  updateCharacter: (id: string, character: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  getCharacter: (id: string) => Character | undefined;
  addPage: (page: Omit<Page, "id">) => string | undefined; // Return new ID
  updatePage: (id: string, page: Partial<Page>) => void;
  deletePage: (id: string) => void;
  getPage: (id: string) => Page | undefined;
  addScene: (scene: Omit<Scene, "id">) => string | undefined; // Return new ID
  updateScene: (id: string, scene: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  getScene: (id: string) => Scene | undefined;
  addEvent: (event: Omit<Event, "id">) => string | undefined; // Return new ID
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => Event | undefined;
  addNote: (note: Omit<Note, "id">) => string | undefined; // Return new ID
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChatHistory: () => void;
  sendMessageToAI: (userMessage: string, chatHistory: ChatMessage[], systemPrompt?: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  saveProject: () => void;
  loadProject: (project: NovelProject) => void;
  getLastModifiedItem: (bookId: string) => { type: string; id: string } | null;
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>;
  associateChatWithEntity: (entityType: string, entityId: string) => void;
  rollbackEntity: (entityType: string, entityId: string, version: string) => void;
}
