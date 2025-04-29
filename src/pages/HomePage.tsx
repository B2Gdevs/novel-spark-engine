
import { useNovel } from "@/contexts/NovelContext";
import { BookCard } from "@/components/BookCard";
import { AiPromptSection } from "@/components/AiPromptSection";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

export function HomePage() {
  const { project, currentBook, addBook, switchBook, addMockData } = useNovel();
  const [showWelcome, setShowWelcome] = useState(true);
  
  useEffect(() => {
    // Show welcome screen if no books
    if (project.books.length > 0) {
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
  }, [project.books]);
  
  const handleAddNewBook = () => {
    addBook({
      title: "New Book",
      description: "Start writing your new story...",
      characters: [],
      scenes: [],
      events: [],
      notes: []
    });
  };
  
  const handleSelectBook = (bookId: string) => {
    switchBook(bookId);
  };

  return (
    <div className="p-6 pt-12">
      <div className="max-w-6xl mx-auto">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <BookOpen className="h-16 w-16 text-purple-400 mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to NovelSpark</h1>
            <p className="text-zinc-400 mb-8 max-w-lg">Start by creating your first book</p>
            
            <Button 
              onClick={handleAddNewBook}
              className="bg-purple-600 hover:bg-purple-700 text-white mb-8 flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Book</span>
            </Button>
            
            <div>
              <p className="text-zinc-400 mb-4">or</p>
              <p className="text-zinc-300 mb-2">Try a prompt:</p>
              <div className="max-w-md mx-auto">
                <AiPromptSection />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {project.books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  showActions={false}
                  onSelect={() => handleSelectBook(book.id)}
                />
              ))}
            </div>
            
            <div className="mt-12">
              <AiPromptSection />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
