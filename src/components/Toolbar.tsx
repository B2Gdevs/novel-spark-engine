
import { BookOpen, User, Calendar, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Toolbar() {
  const location = useLocation();
  
  const navItems = [
    {
      icon: User,
      label: "Characters",
      path: "/characters"
    },
    {
      icon: Calendar,
      label: "Scenes",
      path: "/scenes"
    },
    {
      icon: List,
      label: "Events",
      path: "/events"
    }
  ];

  return (
    <div className="h-12 bg-zinc-900 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <BookOpen className="mr-2 h-5 w-5 text-purple-400" />
        <span className="font-bold text-lg text-white">NovelSpark</span>
      </div>
      
      <div className="flex items-center space-x-1">
        {navItems.map((item) => (
          <Button 
            key={item.path}
            variant="ghost" 
            size="sm"
            asChild
            className={cn(
              "rounded-md bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700",
              location.pathname === item.path && "bg-zinc-700 text-white"
            )}
          >
            <Link to={item.path} className="flex items-center gap-2">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
        >
          Cmd+K
        </Button>
      </div>
    </div>
  );
}
