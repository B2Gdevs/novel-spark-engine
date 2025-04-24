
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { Bot, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DialogProvider } from "@/components/DialogProvider";
import { ChatInterface } from "@/components/ChatInterface";

export function AppSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  
  const sidebarItems = [
    {
      icon: Bot,
      label: "AI Assistant",
      action: () => setShowChatDialog(true),
      tooltip: "Open AI Chat"
    },
    {
      icon: Settings,
      label: "Settings",
      action: () => {},
      tooltip: "Open Settings"
    }
  ];

  return (
    <>
      <DialogProvider
        open={showChatDialog} 
        onOpenChange={setShowChatDialog}
        title="AI Assistant"
      >
        <ChatInterface />
      </DialogProvider>
      
      <div 
        className={cn(
          "bg-zinc-800 border-r border-zinc-700 transition-all duration-300 ease-in-out",
          expanded ? "w-48" : "w-14"
        )}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <Sidebar variant="inset" collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton
                        onClick={item.action}
                        tooltip={expanded ? undefined : item.tooltip}
                        className="flex items-center justify-start p-3 w-full text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className={cn(
                          "ml-3 transition-all duration-200",
                          expanded ? "opacity-100" : "opacity-0"
                        )}>
                          {item.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className={cn(
              "p-3 text-xs text-zinc-500 transition-opacity duration-200",
              expanded ? "opacity-100" : "opacity-0"
            )}>
              <p>NovelSpark v1.0</p>
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  );
}
