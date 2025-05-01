
import { useNovel } from "@/contexts/NovelContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { BookGrid } from "@/components/home/BookGrid";
import { TrashZone } from "@/components/TrashZone";
import { DeleteBookDialog } from "@/components/home/DeleteBookDialog";
import { DragPreview } from "@/components/home/DragPreview";

export function HomePage() {
  const { project, currentBook, addBook, switchBook, deleteBook, getLastModifiedItem } = useNovel();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedBookId, setDraggedBookId] = useState<string | null>(null);
  const [draggedBookPreview, setDraggedBookPreview] = useState<{
    id: string;
    title: string;
    position: { x: number; y: number };
  } | null>(null);
  const [confirmDeleteBook, setConfirmDeleteBook] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Track mouse position for the drag preview
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedBookId) {
        const book = project.books.find(b => b.id === draggedBookId);
        if (book) {
          setDraggedBookPreview({
            id: book.id,
            title: book.title,
            position: { x: e.clientX, y: e.clientY }
          });
        }
      }
    };

    if (draggedBookId) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [draggedBookId, project.books]);
  
  useEffect(() => {
    // Check if we should show the welcome screen
    setShowWelcome(project.books.length === 0);
    
    // Always reset currentBookId when on the homepage
    if (currentBook !== null) {
      console.log("On HomePage, currentBook should be null");
    }
  }, [project.books.length, currentBook]);
  
  const handleAddNewBook = async () => {
    setIsLoading(true);
    try {
      await addBook({
        title: "New Book",
        description: "Start writing your new story...",
        genre: "Fiction",
        characters: [],
        scenes: [],
        events: [],
        notes: [],
        pages: [],
        places: [] // Including the places property
      });
      
      setShowWelcome(false);
    } catch (error) {
      console.error("Error creating new book:", error);
      toast.error("Failed to create new book");
    } finally {
      setIsLoading(false);
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

  const handleConfirmDelete = async () => {
    if (!confirmDeleteBook) return;
    
    try {
      await deleteBook(confirmDeleteBook);
      toast.success("Book moved to trash. It will be permanently deleted after 30 days.");
      
      // Show welcome screen if no books left
      if (project.books.length <= 1) {
        setShowWelcome(true);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    } finally {
      setConfirmDeleteBook(null);
    }
  };

  const handleDeleteBook = (bookId: string) => {
    setConfirmDeleteBook(bookId);
  };

  const handleTrashDrop = () => {
    if (draggedBookId) {
      handleDeleteBook(draggedBookId);
      setDraggedBookId(null);
      setDraggedBookPreview(null);
    }
  };

  return (
    <div className="p-6 pt-12">
      <div className="max-w-6xl mx-auto">
        {showWelcome ? (
          <WelcomeSection 
            onCreateNew={handleAddNewBook} 
            isLoading={isLoading} 
          />
        ) : (
          <BookGrid 
            books={project.books}
            onSelectBook={handleSelectBook}
            onDeleteBook={handleDeleteBook}
            onCreateNew={handleAddNewBook}
            setDraggedBookId={setDraggedBookId}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Always visible trash zone */}
      <TrashZone 
        onDrop={handleTrashDrop}
        draggedItemExists={!!draggedBookId}
      />

      {/* Confirmation dialog */}
      <DeleteBookDialog
        isOpen={!!confirmDeleteBook}
        onClose={() => setConfirmDeleteBook(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Drag Preview */}
      <DragPreview draggedBookPreview={draggedBookPreview} />
    </div>
  );
}
