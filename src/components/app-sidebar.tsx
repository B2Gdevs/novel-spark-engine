
import { 
  Book, 
  User, 
  PenTool, 
  CalendarDays, 
  Library, 
  FileText, 
  MessageSquare,
  Settings,
  Plus
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { project, currentBook, switchBook } = useNovel();
  
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

  const handleBookSelect = (bookId: string) => {
    switchBook(bookId);
    navigate("/assistant");
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="p-3 flex flex-col">
        <div className="flex items-center">
          <Book className="h-5 w-5 text-primary mr-2" />
          <span className="font-medium text-lg">NovelSpark</span>
        </div>
        
        {hasActiveBook && (
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <span>Currently selected:</span>
            </div>
            <div className="font-semibold text-foreground mt-1">
              {currentBook?.title}
            </div>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        {hasActiveBook ? (
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {bookSidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.url)}
                      isActive={item.active}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Welcome</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="p-3 text-sm text-muted-foreground">
                Select a book below to begin
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Books section - Always visible */}
        <SidebarGroup>
          <SidebarGroupLabel>My Books</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {project.books.map(book => (
                <SidebarMenuItem key={book.id}>
                  <SidebarMenuButton 
                    onClick={() => handleBookSelect(book.id)}
                    isActive={currentBook?.id === book.id}
                    tooltip={book.title}
                  >
                    <Book className="h-4 w-4" />
                    <span>{book.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="mt-1"
                  tooltip="Create new book"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Book</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-3">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/")}
                isActive={location.pathname === "/"}
                tooltip="Library"
              >
                <Library className="h-4 w-4" />
                <span>Library</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => {}}
                tooltip="Settings"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <div className="pt-2 mt-2 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/20 text-primary">NS</AvatarFallback>
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
