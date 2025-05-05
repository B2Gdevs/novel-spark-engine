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
  content: string;
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
}

// Add versioning types
export interface EntityVersion {
  id: string;
  entityId: string;
  entityType: 'character' | 'scene' | 'page' | 'place' | 'event';
  versionData: any;
  createdAt: string;
  messageId?: string; // Link to the chat message that created this version
  description?: string; // Short description of what changed in this version
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
  entityVersions?: EntityVersion[]; // Add version history
  chatCheckpoints?: {
    id: string;
    description: string;
    timestamp: number;
    messageIndex: number; // The index in chatHistory at which this checkpoint was created
  }[];
}

// Extend ChatMessage type to track entity creation/updates
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
  entityAction?: 'create' | 'update' | 'restore'; // Track what action was performed
  entityVersionId?: string; // Reference to the version created
  isCheckpoint?: boolean; // Whether this message is a checkpoint
}
