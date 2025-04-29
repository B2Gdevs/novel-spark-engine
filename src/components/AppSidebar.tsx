
import { Book, BookOpen, User, PenTool, CalendarDays, Library } from "lucide-react";
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
import { useNovel } from "@/contexts/NovelContext";

export function AppSidebar() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { currentBook } = useNovel();
  
  // Only show sidebar items if a book is selected
  const bookSidebarItems = [
    {
      icon: User,
      label: "Characters",
      action: () => navigate("/characters"),
      tooltip: "Manage Characters"
    },
    {
      icon: PenTool,
      label: "Scenes",
      action: () => navigate("/scenes"),
      tooltip: "Manage Scenes"
    },
    {
      icon: CalendarDays,
      label: "Timeline",
      action: () => navigate("/events"),
      tooltip: "Manage Timeline"
    },
    {
      icon: Library,
      label: "Notes",
      action: () => navigate("/notes"),
      tooltip: "View Notes"
    },
    {
      icon: BookOpen,
      label: "AI Assistant",
      action: () => navigate("/assistant"),
      tooltip: "Open AI Chat"
    }
  ];

  // If no book is selected, don't render the sidebar content
  if (!currentBook) {
    return null;
  }

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
                {bookSidebarItems.map((item, index) => (
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
      </Sidebar>
    </div>
  );
}
