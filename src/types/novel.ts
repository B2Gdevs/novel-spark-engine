export interface Character {
  id: string;
  name: string;
  traits: string[];
  description: string;
  role: string;
  secrets?: string[];
  relationships?: Relationship[];
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
  characters: string[]; // Character IDs
  location?: string;
  events?: string[]; // Event IDs
  tone?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  characters: string[]; // Character IDs involved
  consequences: string[];
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
  characters: Character[];
  scenes: Scene[];
  events: Event[];
  notes: Note[];
  references?: {
    characters?: string[]; // IDs of characters from other books
    scenes?: string[]; // IDs of scenes from other books
    events?: string[]; // IDs of events from other books
  };
}

export interface NovelProject {
  books: Book[];
  currentBookId: string | null;
  chatHistory: ChatMessage[];
}
