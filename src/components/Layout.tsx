import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toolbar } from "@/components/Toolbar";
import { ReactNode, useEffect, useState } from "react";
import { DialogProvider } from "@/components/DialogProvider";
import { ChatInterface } from "@/components/ChatInterface";
import { toast } from "sonner";

export function Layout({ children }: { children: ReactNode }) {
  const [showChatDialog, setShowChatDialog] = useState(false);
  
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
        <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-auto pt-4 px-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
