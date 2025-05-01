
import React from 'react';
import { BookCard } from "@/components/BookCard";
import { Book } from "@/types/novel";

interface BookGridProps {
  books: Book[];
  onSelectBook: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
  onCreateNew: () => void;
  setDraggedBookId: (id: string | null) => void;
  isLoading: boolean;
}

export function BookGrid({ 
  books, 
  onSelectBook, 
  onDeleteBook, 
  onCreateNew, 
  setDraggedBookId,
  isLoading 
}: BookGridProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Your Books</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onSelect={() => onSelectBook(book.id)}
            onDelete={onDeleteBook}
            setDraggedBookId={setDraggedBookId}
          />
        ))}
        
        <BookCard
          isNewBookCard
          onCreateNew={onCreateNew}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
