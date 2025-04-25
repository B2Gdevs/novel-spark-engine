
import { User, Calendar, List } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

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
    <div className="h-12 bg-zinc-900 border-b border-zinc-800/50 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <BookOpen className="mr-2 h-5 w-5 text-purple-400" />
        <span className="font-bold text-lg text-white">NovelSpark</span>
      </div>
      
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className="group relative flex flex-col items-center"
          >
            <item.icon 
              className={cn(
                "h-5 w-5 transition-colors duration-200",
                location.pathname === item.path 
                  ? "text-white" 
                  : "text-zinc-400 group-hover:text-white"
              )}
            />
            <span className={cn(
              "absolute -bottom-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              location.pathname === item.path ? "text-white" : "text-zinc-400"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
      
      <div className="flex items-center">
        <button 
          className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          Cmd+K
        </button>
      </div>
    </div>
  );
}
