
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
    // Fetch books from Supabase on component mount
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase.from('books').select('*');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Convert Supabase books to our app format
          data.forEach(book => {
            addBook({
              title: book.title,
              description: book.description || "",
              genre: book.genre || "Fiction",
              characters: [],
              scenes: [],
              events: [],
              notes: [],
              pages: []
            });
          });
          
          setShowWelcome(false);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Failed to load books");
      }
    };
    
    // Only fetch books if we don't have any yet
    if (project.books.length === 0) {
      fetchBooks();
    } else {
      setShowWelcome(project.books.length === 0);
    }
  }, []);
  
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
      
      setShowWelcome(false);
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
      // Delete from Supabase first
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);
        
      if (error) {
        throw error;
      }
      
      // Then update local state
      deleteBook(bookId);
      
      // Show welcome screen if no books left
      if (project.books.length <= 1) {
        setShowWelcome(true);
      }
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
                  onDelete={handleDeleteBook}
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
