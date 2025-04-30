
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toolbar } from "@/components/Toolbar";
import { ReactNode, useEffect, useState } from "react";
import { DialogProvider } from "@/components/DialogProvider";
import { ChatInterface } from "@/components/ChatInterface";
import { toast } from "sonner";
import { useNovel } from "@/contexts/NovelContext";
import { useLocation } from "react-router-dom";

export function Layout({ children }: { children: ReactNode }) {
  const [showChatDialog, setShowChatDialog] = useState(false);
  const { currentBook } = useNovel();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  useEffect(() => {
    // Add keyboard shortcut for chat (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowChatDialog(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Show toast about keyboard shortcut
    toast("Press Cmd+K or Ctrl+K to open the AI chat", {
      duration: 5000,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Only wrap content in SidebarProvider if not on homepage or if a book is selected
  if (isHomePage && !currentBook) {
    return (
      <>
        <DialogProvider
          open={showChatDialog} 
          onOpenChange={setShowChatDialog}
          title="AI Assistant"
        >
          <ChatInterface />
        </DialogProvider>
        
        <div className="min-h-screen flex flex-col w-full bg-zinc-900 text-white">
          <Toolbar />
          <div className="flex flex-1 h-[calc(100vh-3rem)] overflow-hidden">
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </>
    );
  }

  return (
    <SidebarProvider>
      <DialogProvider
        open={showChatDialog} 
        onOpenChange={setShowChatDialog}
        title="AI Assistant"
      >
        <ChatInterface />
      </DialogProvider>
      
      <div className="min-h-screen flex flex-col w-full bg-zinc-900 text-white">
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
