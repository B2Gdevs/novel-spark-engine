
import { Button } from "@/components/ui/button";
import { Plus, User, PenTool, Wand2 } from "lucide-react";
import { useState } from "react";
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";

export function CopilotActions() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const { currentBook } = useNovel();

  const handleActionClick = (action: string) => {
    setActiveAction(activeAction === action ? null : action);
    
    if (!currentBook) {
      toast.warning("Please select a book first");
      return;
    }
    
    switch (action) {
      case "character":
        toast("Creating character mode activated");
        break;
      case "scene":
        toast("Creating scene mode activated");
        break;
      case "generate":
        toast("Generation mode activated");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center gap-1">
        <Button
          variant={activeAction === "character" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleActionClick("character")}
          disabled={!currentBook}
          className="text-xs"
        >
          <User className="h-3.5 w-3.5 mr-1" />
          Character
        </Button>
        <Button
          variant={activeAction === "scene" ? "secondary" : "ghost"}
          size="sm" 
          onClick={() => handleActionClick("scene")}
          disabled={!currentBook}
          className="text-xs"
        >
          <PenTool className="h-3.5 w-3.5 mr-1" />
          Scene
        </Button>
        <Button
          variant={activeAction === "generate" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleActionClick("generate")}
          disabled={!currentBook}
          className="text-xs"
        >
          <Wand2 className="h-3.5 w-3.5 mr-1" />
          Generate
        </Button>
      </div>
      
      {!currentBook && (
        <span className="text-xs text-muted-foreground">Select a book to enable actions</span>
      )}
    </div>
  );
}
