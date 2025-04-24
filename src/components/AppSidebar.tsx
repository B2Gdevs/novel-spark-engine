
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
import { Calendar, List, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";

const menuItems = [
  {
    title: "Characters",
    url: "/characters",
    icon: User,
    countSelector: (project: any) => project.characters.length,
  },
  {
    title: "Scenes",
    url: "/scenes",
    icon: Calendar,
    countSelector: (project: any) => project.scenes.length,
  },
  {
    title: "Events",
    url: "/events",
    icon: List,
    countSelector: (project: any) => project.events.length,
  },
  {
    title: "AI Assistant",
    url: "/assistant",
    icon: MessageSquare,
    countSelector: () => 0,
  },
];

export function AppSidebar() {
  const { project } = useNovel();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-novel-purple">✨ NovelSpark</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Novel Elements</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-novel-purple/10 text-xs text-novel-purple font-medium">
                        {item.countSelector(project)}
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
