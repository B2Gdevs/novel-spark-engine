
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
