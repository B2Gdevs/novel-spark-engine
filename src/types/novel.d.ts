
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
  references?: {
    characters?: string[]; // IDs of characters from other books
    scenes?: string[]; // IDs of scenes from other books
    events?: string[]; // IDs of events from other books
  };
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string; // Add this for soft-deleted books
  isDeleted?: boolean; // Flag for soft-deleted books
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
  entityAction?: 'create' | 'update' | 'restore'; // Track what action was performed
  entityVersionId?: string; // Reference to the version created
  isCheckpoint?: boolean; // Whether this message is a checkpoint
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
  secrets?: string[]; // Add this property
  relationships?: any[]; // Add this property
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
  tone?: string; // Add this property
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
  tags?: string[]; // Add this property
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
  entityVersions?: EntityVersion[]; // Add version history
  chatCheckpoints?: {
    id: string;
    description: string;
    timestamp: number;
    messageIndex: number; // The index in chatHistory at which this checkpoint was created
  }[];
}

// Add this interface for entity versions
export interface EntityVersion {
  id: string;
  entityId: string;
  entityType: 'character' | 'scene' | 'page' | 'place' | 'event';
  versionData: any;
  createdAt: string;
  messageId?: string;
  description?: string;
}
