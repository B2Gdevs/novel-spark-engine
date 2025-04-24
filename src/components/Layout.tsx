
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toolbar } from "@/components/Toolbar";
import { ReactNode, useEffect, useState } from "react";
import { DialogProvider } from "@/components/DialogProvider";
import { ChatInterface } from "@/components/ChatInterface";
import { toast } from "sonner";
import { useNovel } from "@/contexts/NovelContext";
import { CommandMenu } from "@/components/CommandMenu";

export function Layout({ children }: { children: ReactNode }) {
  const [showChatDialog, setShowChatDialog] = useState(false);
  const { addMockData } = useNovel();

  useEffect(() => {
    // Add keyboard shortcut for chat (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowChatDialog(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Add mock data on first load
    addMockData();
    
    // Show toast about keyboard shortcut
    toast("Press Cmd+K or Ctrl+K to open the AI chat", {
      duration: 5000,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [addMockData]);

  return (
    <SidebarProvider>
      <DialogProvider
        open={showChatDialog} 
        onOpenChange={setShowChatDialog}
        title="AI Assistant"
      >
        <ChatInterface />
      </DialogProvider>
      
      <CommandMenu />
      
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
