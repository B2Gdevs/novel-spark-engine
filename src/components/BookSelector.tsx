
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Book {
  id: string;
  title: string;
  icon: string;
}

export function BookSelector() {
  const currentBook: Book = {
    id: "1",
    title: "The Iron Wars",
    icon: "📕"
  };

  return (
    <Button 
      variant="ghost" 
      className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-lg rounded-lg border border-zinc-800"
    >
      <span className="text-lg">{currentBook.icon}</span>
      <span className="text-white">{currentBook.title}</span>
      <ChevronRight className="h-4 w-4 text-zinc-400" />
    </Button>
  );
}
