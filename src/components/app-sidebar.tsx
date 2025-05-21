
import React from "react";
import { 
  Book, 
  User, 
  PenTool, 
  CalendarDays, 
  Library, 
  FileText, 
  MessageSquare,
  ChevronRight 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { project, currentBook } = useNovel();
  
  // Book-related sidebar items with icons
  const bookSidebarItems = [
    {
      title: "Characters",
      icon: User,
      url: "/characters",
      active: location.pathname.includes("/characters"),
    },
    {
      title: "Pages",
      icon: FileText,
      url: "/pages",
      active: location.pathname.includes("/pages"),
    },
    {
      title: "Scenes",
      icon: PenTool,
      url: "/scenes",
      active: location.pathname.includes("/scenes"),
    },
    {
      title: "Timeline",
      icon: CalendarDays,
      url: "/events",
      active: location.pathname.includes("/events"),
    },
    {
      title: "AI Assistant",
      icon: MessageSquare,
      url: "/assistant",
      active: location.pathname.includes("/assistant"),
    }
  ];

  const hasActiveBook = !!currentBook && 
    !!project.books.find(book => book.id === currentBook.id);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-2">
        <div className="flex items-center">
          <Book className="h-6 w-6 text-primary mr-2" />
          <span className="font-semibold text-lg">NovelSpark</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {hasActiveBook ? (
          <SidebarGroup>
            <SidebarGroupLabel>{currentBook?.title || "Current Book"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {bookSidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.url)}
                      isActive={item.active}
                      tooltip={item.title}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Library</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="p-3 text-center text-sm text-muted-foreground">
                Select a book to see options
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/")}
                isActive={location.pathname === "/"}
                tooltip="Library"
              >
                <Library className="h-5 w-5" />
                <span>Library</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">NS</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
              <span className="font-medium">User</span>
              <span className="text-xs text-muted-foreground">Author</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
