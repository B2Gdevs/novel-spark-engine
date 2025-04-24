
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4">
            <SidebarTrigger />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="relative"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className={`flex-1 p-4 overflow-auto ${isChatOpen ? 'mr-80' : ''}`}>
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
            {isChatOpen && (
              <div className="w-80 border-l border-border bg-background overflow-y-auto">
                <ChatInterface />
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
