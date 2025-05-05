
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Page } from "@/types/novel";

export function PageForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBook, getPage, updatePage, deletePage, addPage } = useNovel();
  
  const [page, setPage] = useState<Partial<Page>>({
    title: "",
    content: "",
    order: 0
  });
  
  const isNewPage = id === "new";
  
  useEffect(() => {
    if (!currentBook) {
      navigate("/");
      return;
    }
    
    if (!isNewPage && id) {
      const existingPage = getPage(id);
      if (existingPage) {
        setPage({
          title: existingPage.title,
          content: existingPage.content,
          order: existingPage.order
        });
      } else {
        navigate("/pages");
        toast.error("Page not found");
      }
    }
  }, [id, currentBook, getPage, navigate, isNewPage]);
  
  const savePage = () => {
    const timestamp = new Date().toISOString();
    
    if (id === 'new') {
      const newPage: Omit<Page, 'id'> = {
        title: page.title || '',
        content: page.content || '',
        order: page.order || currentBook!.pages.length,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      addPage(newPage);
      navigate('/pages');
    } else if (id) {
      updatePage(id, {
        title: page.title,
        content: page.content
      });
      toast.success("Page updated successfully");
    }
  };
  
  const handleDelete = () => {
    if (!isNewPage && id) {
      deletePage(id);
      toast.success("Page deleted successfully");
      navigate("/pages");
    }
  };
  
  if (!currentBook) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/pages")}
          className="text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Pages
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          {isNewPage ? "New Page" : page.title}
        </h1>
        <div className="flex space-x-2">
          {!isNewPage && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          )}
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
            onClick={savePage}
          >
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>
      </div>
      
      <div className="space-y-6 max-w-4xl">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Title
          </label>
          <Input 
            value={page.title || ''}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Content
          </label>
          <Textarea 
            value={page.content || ''}
            onChange={(e) => setPage({ ...page, content: e.target.value })}
            className="min-h-[60vh] bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>
    </div>
  );
}
