
export interface Character {
  id: string;
  name: string;
  traits: string[];
  description: string;
  role: string;
  age?: number;
  backstory?: string;
  imageUrl?: string;
  secrets?: string[];
  relationships?: Relationship[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Relationship {
  characterId: string;
  type: string;
  description: string;
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  description?: string;
  characters: string[]; // Character IDs
  location?: string;
  events?: string[]; // Event IDs
  notes?: string;
  tone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  order: number;
  chapterId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  characters: string[]; // Character IDs involved
  consequences: string[];
  date?: string;
  impact?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  relatedEntities?: {
    characters?: string[];
    scenes?: string[];
    events?: string[];
    notes?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  genre?: string;
  characters: Character[];
  scenes: Scene[];
  events: Event[];
  notes: Note[];
  pages: Page[];
  references?: {
    characters?: string[]; // IDs of characters from other books
    scenes?: string[]; // IDs of scenes from other books
    events?: string[]; // IDs of events from other books
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface NovelProject {
  books: Book[];
  currentBookId: string | null;
  chatHistory: ChatMessage[];
}
