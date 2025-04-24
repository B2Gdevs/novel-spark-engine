
import { Bot, Settings, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ChatInterface } from "@/components/ChatInterface";

export function Toolbar() {
  return (
    <div className="h-12 bg-white dark:bg-zinc-800 border-b border-border flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <BookOpen className="mr-2 h-5 w-5 text-novel-purple" />
        <span className="font-bold text-lg">NovelSpark</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bot className="h-5 w-5 text-novel-purple" />
              <span className="sr-only">AI Assistant</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh]">
            <div className="p-4 h-full">
              <ChatInterface />
            </div>
          </DrawerContent>
        </Drawer>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </div>
  );
}
