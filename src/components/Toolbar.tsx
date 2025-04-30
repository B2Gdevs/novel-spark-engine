
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { useNovel } from "@/contexts/NovelContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Toolbar() {
  const location = useLocation();
  const { currentBook, addBook } = useNovel();
  
  const handleAddNewBook = async () => {
    try {
      // Insert a new book into Supabase
      const { data: newBook, error } = await supabase
        .from('books')
        .insert([
          {
            title: "New Book",
            description: "Start writing your new story...",
            genre: "Fiction"
          }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Add the book to local state
      addBook({
        title: newBook.title,
        description: newBook.description || "",
        genre: newBook.genre || "Fiction",
        characters: [],
        scenes: [],
        events: [],
        notes: [],
        pages: []
      });
      
      toast.success("New book created");
    } catch (error) {
      console.error("Error creating new book:", error);
      toast.error("Failed to create new book");
    }
  };
  
  return (
    <div className="h-12 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-purple-400" />
          <span className="font-bold text-lg text-white">NovelSpark</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        {currentBook && (
          <div className="flex items-center bg-zinc-800/70 rounded-md px-3 py-1.5 mr-2">
            <div className="h-4 w-4 bg-red-500 rounded-sm mr-2"></div>
            <span className="text-white text-sm font-medium">{currentBook.title}</span>
            <ChevronRight className="h-4 w-4 text-zinc-400 ml-1" />
          </div>
        )}
        
        <Button
          variant="ghost"
          className="text-zinc-300 hover:text-white hover:bg-zinc-800 flex gap-2 items-center px-3 py-1.5 h-8 text-sm"
          onClick={handleAddNewBook}
        >
          <span className="text-sm">+ New Book</span>
        </Button>
      </div>
    </div>
  );
}
