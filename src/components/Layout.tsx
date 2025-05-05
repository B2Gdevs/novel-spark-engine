
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toolbar } from "@/components/Toolbar";
import { ReactNode, useEffect, useState } from "react";
import { DialogProvider } from "@/components/DialogProvider";
import { ChatInterface } from "@/components/ChatInterface";
import { toast } from "sonner";
import { useNovel } from "@/contexts/NovelContext";
import { useLocation, useNavigate } from "react-router-dom";

export function Layout({ children }: { children: ReactNode }) {
  const [showChatDialog, setShowChatDialog] = useState(false);
  const { currentBook, getLastModifiedItem } = useNovel();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  
  useEffect(() => {
    // Add keyboard shortcut for chat (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (currentBook) { // Only show chat if a book is selected
          setShowChatDialog(prev => !prev);
        } else {
          toast.warning("Please select a book first to use the AI assistant");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Show toast about keyboard shortcut
    const toastMessage = currentBook 
      ? "Press Cmd+K or Ctrl+K to open the AI chat"
      : "Select a book first to use the AI assistant with Cmd+K or Ctrl+K";
      
    toast(toastMessage, {
      duration: 5000,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentBook]);

  // Navigate to latest page if a book is selected
  useEffect(() => {
    if (currentBook && isHomePage) {
      const lastItem = getLastModifiedItem(currentBook.id);
      
      if (lastItem && lastItem.type === 'pages') {
        // Navigate to the last modified page
        setTimeout(() => {
          navigate(`/pages/${lastItem.id}`);
        }, 300);
      } else if (lastItem) {
        // Navigate to the appropriate section based on last edited item
        setTimeout(() => {
          navigate(`/${lastItem.type}/${lastItem.id}`);
        }, 300);
      } else {
        // If no items exist yet, navigate to assistant as default
        setTimeout(() => {
          navigate("/assistant");
        }, 300);
      }
    }
  }, [currentBook, isHomePage, navigate, getLastModifiedItem]);

  return (
    <SidebarProvider>
      <DialogProvider
        open={showChatDialog} 
        onOpenChange={setShowChatDialog}
        title={currentBook ? `AI Assistant - ${currentBook.title}` : "AI Assistant"}
      >
        <ChatInterface />
      </DialogProvider>
      
      <div className="min-h-screen flex flex-col w-full bg-white text-gray-900">
        <Toolbar />
        <div className="flex flex-1 h-[calc(100vh-3rem)] overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
