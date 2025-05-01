
import { Book, Character, Scene, Event, Note, ChatMessage, NovelProject, Page } from "@/types/novel";

export interface NovelContextType {
  project: NovelProject;
  currentBook: Book | null;
  apiKey: string;
  setApiKey: (key: string) => void;
  addBook: (book: Omit<Book, "id">) => void;
  deleteBook: (id: string) => void;
  switchBook: (id: string) => void;
  addCharacter: (character: Omit<Character, "id">) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  getCharacter: (id: string) => Character | undefined;
  addPage: (page: Omit<Page, "id">) => void;
  updatePage: (id: string, page: Partial<Page>) => void;
  deletePage: (id: string) => void;
  getPage: (id: string) => Page | undefined;
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
  getLastModifiedItem: (bookId: string) => { type: string; id: string } | null;
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>;
}
