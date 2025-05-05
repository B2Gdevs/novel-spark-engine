
export interface Book {
  id: string;
  title: string;
  author?: string;
  genre?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  pages: Page[];
  scenes: Scene[];
  events: Event[];
  characters: Character[];
  places?: Place[];
  notes: Note[];
  summary?: string;
  deletedAt?: string;
  isDeleted?: boolean;
}

export interface Character {
  id: string;
  name: string;
  description?: string;
  traits?: string[];
  role?: string;
  age?: number;
  backstory?: string;
  imageUrl?: string;
  secrets?: string[];
  relationships?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  title: string;
  content?: string;
  description?: string;
  location?: string;
  characters: string[];
  notes?: string;
  tone?: string;
  events?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date?: string;
  characters: string[];
  consequences: string[];
  impact?: string;
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

export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  entityType?: string | null;
  entityId?: string | null;
  mentionedEntities?: Array<{
    type: string;
    id: string;
    name: string;
  }>;
  entityAction?: 'create' | 'update' | 'restore';
  entityVersionId?: string;
  isCheckpoint?: boolean;
}

// Add versioning types
export interface EntityVersion {
  id: string;
  entityId: string;
  entityType: 'character' | 'scene' | 'page' | 'place' | 'event';
  versionData: any;
  createdAt: string;
  messageId?: string;
  description?: string;
}

// Add version history to the NovelProject type
export interface NovelProject {
  books: Book[];
  currentBookId: string | null;
  chatHistory: ChatMessage[];
  currentChatContext?: {
    entityType: string;
    entityId: string;
  };
  entityVersions?: EntityVersion[];
  chatCheckpoints?: {
    id: string;
    description: string;
    timestamp: number;
    messageIndex: number;
  }[];
}
