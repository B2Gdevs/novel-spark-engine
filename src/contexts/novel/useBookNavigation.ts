
import { useCallback } from "react";
import { NovelProject } from "@/types/novel";
import { toast } from "sonner";

export function useBookNavigation(
  project: NovelProject,
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>
) {
  const switchBook = (id: string) => {
    setProject(prev => ({
      ...prev,
      currentBookId: id
    }));
    toast.success("Switched to different book");
  };

  const getLastModifiedItem = useCallback((bookId: string) => {
    const book = project.books.find(b => b.id === bookId);
    if (!book) return null;
    
    const items = [
      ...book.scenes.map(s => ({ type: "scenes", id: s.id, date: s.updatedAt || s.createdAt || "" })),
      ...book.characters.map(c => ({ type: "characters", id: c.id, date: c.updatedAt || c.createdAt || "" })),
      ...book.events.map(e => ({ type: "events", id: e.id, date: e.updatedAt || e.createdAt || "" })),
      ...book.notes.map(n => ({ type: "notes", id: n.id, date: n.updatedAt || n.createdAt || "" })),
      ...book.pages.map(p => ({ type: "pages", id: p.id, date: p.updatedAt || p.createdAt || "" }))
    ];
    
    if (items.length === 0) return null;
    
    // Sort by date, most recent first
    items.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Return the most recent item
    return { type: items[0].type, id: items[0].id };
  }, [project.books]);

  return {
    switchBook,
    getLastModifiedItem
  };
}
