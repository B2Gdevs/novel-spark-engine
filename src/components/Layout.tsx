
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toolbar } from "@/components/Toolbar";
import { ChatInterface } from "@/components/ChatInterface";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-zinc-50 dark:bg-zinc-900">
        <Toolbar />
        <div className="flex flex-1 h-[calc(100vh-3rem)] overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
