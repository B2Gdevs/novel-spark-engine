
export interface Book {
  id: string;
  title: string;
  description: string;
  genre?: string;
  summary?: string;  // Added book summary field
  characters: Character[];
  scenes: Scene[];
  events: Event[];
  notes: Note[];
  pages: Page[];
  places?: Place[];  // Make places optional for backward compatibility
  createdAt: string;
  updatedAt: string;
}
