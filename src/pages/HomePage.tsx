
import { useNovel } from "@/contexts/NovelContext";
import { BookCard } from "@/components/BookCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

export function HomePage() {
  const { project, currentBook, addBook, switchBook, deleteBook, getLastModifiedItem } = useNovel();
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we should show the welcome screen
    setShowWelcome(project.books.length === 0);
    
    // Always reset currentBookId when on the homepage 
    // This ensures sidebar shows "Select a book" message
    if (currentBook !== null) {
      console.log("On HomePage, currentBook should be null");
    }
    
    console.log("HomePage state:", { 
      currentBookId: project.currentBookId, 
      booksCount: project.books.length,
      showWelcome 
    });
  }, [project.books.length, currentBook]);
  
  const handleAddNewBook = async () => {
    try {
      // Create a new book locally if Supabase integration is not set up
      addBook({
        title: "New Book",
        description: "Start writing your new story...",
        genre: "Fiction",
        characters: [],
        scenes: [],
        events: [],
        notes: [],
        pages: []
      });
      
      setShowWelcome(false);
      toast.success("New book created successfully");
    } catch (error) {
      console.error("Error creating new book:", error);
      toast.error("Failed to create new book");
    }
  };
  
  const handleSelectBook = (bookId: string) => {
    switchBook(bookId);
    
    // Navigate to the most recently updated page
    const lastItem = getLastModifiedItem(bookId);
    
    if (lastItem) {
      navigate(`/${lastItem.type}/${lastItem.id}`);
    } else {
      // If no items exist yet, navigate to pages as default
      navigate("/pages");
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      // Delete the book locally
      deleteBook(bookId);
      
      // Show welcome screen if no books left
      if (project.books.length <= 1) {
        setShowWelcome(true);
      }
      
      toast.success("Book deleted successfully");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    }
  };

  return (
    <div className="p-6 pt-12">
      <div className="max-w-6xl mx-auto">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <BookOpen className="h-16 w-16 text-purple-400 mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to NovelSpark</h1>
            <p className="text-zinc-400 mb-8 max-w-lg">Start by creating your first book</p>
            
            <div className="w-64">
              <BookCard isNewBookCard onCreateNew={handleAddNewBook} />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">Your Books</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={() => handleSelectBook(book.id)}
                  onDelete={() => handleDeleteBook(book.id)}
                />
              ))}
              
              <BookCard
                isNewBookCard
                onCreateNew={handleAddNewBook}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
