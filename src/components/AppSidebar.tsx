
import { Bot, CreditCard, Settings, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
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
import { DialogProvider } from "@/components/DialogProvider";
import { ChatInterface } from "@/components/ChatInterface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
          "bg-zinc-900 border-r border-zinc-700 transition-all duration-300 ease-in-out",
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
                        className="flex items-center justify-start p-3 w-full text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
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
            <div className="p-2 space-y-2">
              <SidebarMenuButton
                tooltip={expanded ? undefined : "Billing"}
                className="flex items-center justify-start p-3 w-full text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              >
                <CreditCard className="h-5 w-5" />
                <span className={cn(
                  "ml-3 transition-all duration-200",
                  expanded ? "opacity-100" : "opacity-0"
                )}>
                  Billing
                </span>
              </SidebarMenuButton>
              
              <SidebarMenuButton
                tooltip={expanded ? undefined : "Profile"}
                className="flex items-center justify-start p-3 w-full text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <span className={cn(
                  "ml-3 transition-all duration-200",
                  expanded ? "opacity-100" : "opacity-0"
                )}>
                  Profile
                </span>
              </SidebarMenuButton>
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  );
}
