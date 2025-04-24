
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex">
          {/* Content area */}
          <div className="flex-1 p-4 overflow-auto max-w-4xl border-r border-border">
            <div className="max-w-3xl mx-auto">
              {children}
            </div>
          </div>
          
          {/* Fixed chat interface */}
          <div className="w-[440px] border-l border-border bg-background">
            <ChatInterface />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
