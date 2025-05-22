
import { SidebarProvider, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toolbar } from "@/components/Toolbar";
import { ReactNode, useEffect, useState } from "react";
import { DialogProvider } from "@/components/DialogProvider";
import { ChatInterface } from "@/components/ChatInterface";
import { toast } from "sonner";
import { useNovel } from "@/contexts/NovelContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

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
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentBook]);

  useEffect(() => {
    // Show toast about keyboard shortcut (only once)
    if (!currentBook) return;
    
    const hasShownToast = sessionStorage.getItem('shown-shortcut-toast');
    if (!hasShownToast) {
      toast("Press Cmd+K or Ctrl+K to open the AI chat", {
        duration: 5000,
      });
      sessionStorage.setItem('shown-shortcut-toast', 'true');
    }
  }, [currentBook]);

  return (
    <SidebarProvider>
      <DialogProvider
        open={showChatDialog} 
        onOpenChange={setShowChatDialog}
        title={currentBook ? `AI Assistant - ${currentBook.title}` : "AI Assistant"}
      >
        <ChatInterface />
      </DialogProvider>
      
      <div className="min-h-screen flex flex-col w-full">
        <Toolbar />
        <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
          <AppSidebar />
          <SidebarInset className="bg-background">
            <header className="flex h-14 shrink-0 items-center border-b">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mx-2 h-4" />
                <span className="font-medium">{currentBook?.title || "Library"}</span>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
