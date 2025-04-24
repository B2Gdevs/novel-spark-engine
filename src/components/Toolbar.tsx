
import { BookOpen, User, Calendar, List, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CommandMenu } from "@/components/CommandMenu";

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
    },
    {
      icon: Book,
      label: "Books",
      path: "/books"
    }
  ];

  return (
    <div className="h-12 backdrop-blur-xl bg-[#1A1F2C]/50 border-b border-white/5 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <BookOpen className="mr-2 h-5 w-5 text-purple-400" />
        <span className="font-bold text-lg text-white/90">NovelSpark</span>
      </div>
      
      <div className="flex items-center space-x-1">
        {navItems.map((item) => (
          <Button 
            key={item.path}
            variant="ghost" 
            size="sm"
            asChild
            className={cn(
              "text-white/70 hover:text-white bg-white/10 hover:bg-white/15 transition-colors",
              location.pathname === item.path && "bg-white/15 text-white"
            )}
          >
            <Link to={item.path} className="flex items-center gap-2">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
      
      <div className="flex-1" /> {/* This pushes the Cmd+K button to the right */}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
      >
        Cmd+K
      </Button>
    </div>
  );
}
