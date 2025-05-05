
import { Book, User, PenTool, CalendarDays, Library, FileText, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";

export function AppSidebar() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { project, currentBook } = useNovel();
  const [hasActiveBook, setHasActiveBook] = useState(false);
  
  // Book-related sidebar items
  const bookSidebarItems = [
    {
      icon: User,
      label: "Characters",
      action: () => navigate("/characters"),
      tooltip: "Manage Characters"
    },
    {
      icon: FileText,
      label: "Pages",
      action: () => navigate("/pages"),
      tooltip: "Manage Pages"
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
      icon: MessageSquare,
      label: "AI Assistant",
      action: () => navigate("/assistant"),
      tooltip: "Open AI Chat"
    }
  ];

  // Force re-check of currentBook on route changes or project changes
  useEffect(() => {
    // Double-check if we have a current book that actually exists
    const bookExists = !!currentBook && 
      !!project.books.find(book => book.id === currentBook.id);
    
    setHasActiveBook(bookExists);
    
    // If we're on the home page, we should always show the "no book selected" state
    if (location.pathname === "/") {
      setHasActiveBook(false);
    }
    
    console.log("Sidebar state:", { 
      currentBookId: project.currentBookId,
      currentBook: currentBook,
      hasActiveBook: bookExists,
      booksCount: project.books.length,
      pathname: location.pathname,
      showingSidebarItems: hasActiveBook
    });
  }, [currentBook, project, location.pathname]);

  return (
    <div 
      className={cn(
        "bg-gray-800 border-r border-gray-600 transition-all duration-300 ease-in-out",
        expanded ? "w-48" : "w-14"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <Sidebar variant="inset" collapsible="none" className="bg-gray-800">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {hasActiveBook ? (
                  // Show book navigation items ONLY when a book is selected
                  bookSidebarItems.map((item, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton
                        onClick={item.action}
                        tooltip={expanded ? undefined : item.tooltip}
                        className="flex items-center justify-start p-3 w-full text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
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
                  ))
                ) : (
                  // Message displayed when no book is selected - fixed positioning
                  <div className="flex flex-col items-start justify-center px-4 py-3 text-center">
                    <Book className="h-5 w-5 text-gray-400 mb-2" />
                    <div className={cn(
                      "text-gray-400 text-xs transition-opacity duration-200 text-left",
                      expanded ? "opacity-100" : "opacity-0"
                    )}>
                      Select a book to see options
                    </div>
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-3 border-t border-gray-700">
          <div className="flex flex-col space-y-3">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center justify-start text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors w-full"
            >
              <Library className="h-5 w-5" />
              <span className={cn(
                "ml-3 transition-all duration-200",
                expanded ? "opacity-100" : "opacity-0"
              )}>
                Library
              </span>
            </Button>
            <div className="flex items-center p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-purple-700">NS</AvatarFallback>
              </Avatar>
              <span className={cn(
                "ml-3 text-gray-300 text-sm transition-all duration-200",
                expanded ? "opacity-100" : "opacity-0"
              )}>
                User
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
