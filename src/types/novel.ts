
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

export interface NovelProject {
  characters: Character[];
  scenes: Scene[];
  events: Event[];
  notes: Note[];
  chatHistory: ChatMessage[];
}
