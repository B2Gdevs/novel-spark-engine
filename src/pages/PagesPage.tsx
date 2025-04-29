
import { useState } from "react";
import { useNovel } from "@/contexts/NovelContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Page } from "@/types/novel";

export function PagesPage() {
  const { currentBook, addPage } = useNovel();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  if (!currentBook) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6">
        <FileText className="h-16 w-16 text-zinc-400 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-300 mb-2">No Book Selected</h1>
        <p className="text-zinc-400 mb-6">Please select a book to view pages</p>
        <Button onClick={() => navigate("/")} variant="outline">
          Go to Books
        </Button>
      </div>
    );
  }

  const handleAddPage = () => {
    const newPageOrder = currentBook.pages.length > 0
      ? Math.max(...currentBook.pages.map(p => p.order || 0)) + 1
      : 1;
      
    addPage({
      title: `Page ${newPageOrder}`,
      content: "",
      order: newPageOrder
    });
    
    // Navigate to the newly created page
    const newPageId = currentBook.pages[currentBook.pages.length - 1].id;
    navigate(`/pages/${newPageId}`);
  };
  
  const handleSelectPage = (page: Page) => {
    navigate(`/pages/${page.id}`);
  };
  
  // Filter pages based on search query
  const filteredPages = searchQuery
    ? currentBook.pages.filter(page => 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentBook.pages;
  
  // Sort pages by order
  const sortedPages = [...filteredPages].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Pages</h1>
          <p className="text-zinc-400">Manage your book's pages</p>
        </div>
        <Button 
          onClick={handleAddPage} 
          className="bg-purple-600 hover:bg-purple-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> New Page
        </Button>
      </div>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search pages..."
          className="bg-zinc-800 border-zinc-700 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {sortedPages.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {sortedPages.map((page) => (
            <div
              key={page.id}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:bg-zinc-700 transition-colors"
              onClick={() => handleSelectPage(page)}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-white">{page.title}</h3>
                  <p className="text-zinc-400 line-clamp-1">
                    {page.content ? page.content.substring(0, 100) : "Empty page"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <FileText className="h-12 w-12 text-zinc-500 mb-4" />
          <h2 className="text-xl font-medium text-zinc-300 mb-2">No pages yet</h2>
          <p className="text-zinc-400 text-center mb-6">
            {searchQuery ? "No pages match your search" : "Start by creating your first page"}
          </p>
          {!searchQuery && (
            <Button 
              onClick={handleAddPage}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Create First Page
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
