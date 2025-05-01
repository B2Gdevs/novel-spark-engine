
import { useState, useEffect } from 'react';
import { NovelProject } from '@/types/novel';

// Default project state
const defaultProject: NovelProject = {
  books: [],
  currentBookId: null,
  chatHistory: []
};

export function useProjectState() {
  const [project, setProject] = useState<NovelProject>(() => {
    try {
      const savedProject = localStorage.getItem("novelProject");
      if (savedProject) {
        const parsedProject = JSON.parse(savedProject);
        // Ensure the structure is valid
        return {
          books: Array.isArray(parsedProject.books) ? parsedProject.books.map((book: any) => ({
            ...book,
            pages: Array.isArray(book.pages) ? book.pages : []
          })) : [],
          currentBookId: parsedProject.currentBookId || null,
          chatHistory: Array.isArray(parsedProject.chatHistory) ? parsedProject.chatHistory : []
        };
      }
      return defaultProject;
    } catch (e) {
      console.error("Error loading project from localStorage:", e);
      return defaultProject;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("novelProject", JSON.stringify(project));
    } catch (e) {
      console.error("Error saving project to localStorage:", e);
    }
  }, [project]);

  return {
    project,
    setProject
  };
}
