import { Bot, CreditCard, Settings, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  const sidebarItems = [
    {
      icon: Bot,
      label: "AI Assistant",
      action: () => navigate("/assistant"),
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
            <Popover>
              <PopoverTrigger asChild>
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
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 bg-zinc-800 border-zinc-700">
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Billing Overview</h4>
                  <p className="text-sm text-zinc-400">Manage your subscription and billing details.</p>
                  <Button variant="outline" className="w-full mt-2 bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600">
                    Manage Subscription
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
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
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 bg-zinc-800 border-zinc-700">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-white">John Doe</h4>
                      <p className="text-sm text-zinc-400">john@example.com</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
