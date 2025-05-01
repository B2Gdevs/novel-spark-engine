
import React, { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NovelProject, Book } from "@/types/novel";

interface NovelDataFetcherProps {
  project: NovelProject;
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>;
  children: React.ReactNode;
}

export function NovelDataFetcher({ project, setProject, children }: NovelDataFetcherProps) {
  // Fetch books from Supabase on initialization
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setProject(prev => {
            const transformedBooks = data.map(dbBook => {
              // Find if we already have this book in local state to preserve its entities
              const existingBook = prev.books.find(book => book.id === dbBook.id);
              
              return {
                id: dbBook.id,
                title: dbBook.title,
                description: dbBook.description || "",
                genre: dbBook.genre || "Fiction",
                characters: existingBook?.characters || [],
                scenes: existingBook?.scenes || [],
                events: existingBook?.events || [],
                notes: existingBook?.notes || [],
                pages: existingBook?.pages || [],
                places: existingBook?.places || [], // Add the places property
                createdAt: dbBook.created_at,
                updatedAt: dbBook.updated_at
              };
            });
            
            return {
              ...prev,
              books: transformedBooks,
              // If we previously had a currentBookId but it's no longer in the books array
              // then set currentBookId to null
              currentBookId: transformedBooks.some(book => book.id === prev.currentBookId) 
                ? prev.currentBookId 
                : null
            };
          });
        }
      } catch (error) {
        console.error("Error fetching books from Supabase:", error);
        toast.error("Failed to load books from database");
      }
    };
    
    fetchBooks();
  }, [setProject]);

  return <>{children}</>;
}
