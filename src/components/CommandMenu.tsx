
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Bot, User, Calendar, List, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="max-h-[300px]">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => navigate("/characters"))}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Characters</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/scenes"))}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Scenes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/events"))}
          >
            <List className="mr-2 h-4 w-4" />
            <span>Events</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="AI">
          <CommandItem
            onSelect={() => runCommand(() => navigate("/assistant"))}
          >
            <Bot className="mr-2 h-4 w-4" />
            <span>Chat with AI Assistant</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => {})}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Open Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
