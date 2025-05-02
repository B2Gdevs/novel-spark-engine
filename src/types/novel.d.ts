
export interface Book {
  id: string;
  title: string;
  description: string;
  genre?: string;
  summary?: string;
  characters: Character[];
  scenes: Scene[];
  events: Event[];
  notes: Note[];
  pages: Page[];
  places: Place[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  entityType?: string | null;
  entityId?: string | null;
  mentionedEntities?: Array<{
    type: string;
    id: string;
    name: string;
  }>;
}

export interface Character {
  id: string;
  name: string;
  description?: string;
  role?: string;
  traits?: string[];
  age?: number;
  backstory?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  title: string;
  description?: string;
  content?: string;
  location?: string;
  characters?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  content?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Place {
  id: string;
  name: string;
  description?: string;
  geography?: string;
  culturalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date?: string;
  impact?: string;
  consequences?: string[];
  characters?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NovelProject {
  books: Book[];
  currentBookId: string | null;
  chatHistory: ChatMessage[];
  currentChatContext?: {
    entityType: string;
    entityId: string;
  } | null;
}
