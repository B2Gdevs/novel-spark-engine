
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

import { Book, User, Calendar, List, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";

export function AppSidebar() {
  const { project, currentBook } = useNovel();

  const bookElements = [
    {
      title: "Characters",
      url: "/characters",
      icon: User,
      count: currentBook?.characters.length || 0,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Scenes",
      url: "/scenes",
      icon: Calendar,
      count: currentBook?.scenes.length || 0,
      color: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Events",
      url: "/events",
      icon: List,
      count: currentBook?.events.length || 0,
      color: "text-blue-500", 
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="px-4 pt-6 pb-2">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-novel-purple text-white hover:bg-novel-purple/90 hover:text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-[220px] p-2">
                <div className="grid gap-2 p-2">
                  <Link to="/characters/new" className="flex items-center gap-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/30">
                      <User className="h-4 w-4 text-purple-500" />
                    </div>
                    <span>New Character</span>
                  </Link>
                  <Link to="/scenes/new" className="flex items-center gap-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <div className="p-1 rounded bg-orange-100 dark:bg-orange-900/30">
                      <Calendar className="h-4 w-4 text-orange-500" />
                    </div>
                    <span>New Scene</span>
                  </Link>
                  <Link to="/events/new" className="flex items-center gap-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                      <List className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>New Event</span>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Book className="h-4 w-4 mr-2" />
            Book Elements
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bookElements.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${item.bgColor}`}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <span>{item.title}</span>
                      </div>
                      <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${item.bgColor} text-xs ${item.color} font-medium`}>
                        {item.count}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 text-sm text-muted-foreground">
          <p>NovelSpark Engine v1.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
