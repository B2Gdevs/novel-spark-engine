
import { useState } from "react";
import { useNovel } from "@/contexts/NovelContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlagIcon, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export function ChatCheckpoints() {
  const [open, setOpen] = useState(false);
  const { project, restoreChatCheckpoint } = useNovel();

  const checkpoints = project.chatCheckpoints || [];
  
  const handleRestore = (checkpointId: string) => {
    restoreChatCheckpoint(checkpointId);
    setOpen(false);
  };

  // If no checkpoints, show disabled button
  if (checkpoints.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <FlagIcon className="h-4 w-4 mr-2" />
        No checkpoints
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FlagIcon className="h-4 w-4 mr-2" />
          Checkpoints ({checkpoints.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Checkpoints</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {checkpoints.map((checkpoint, index) => (
              <div 
                key={checkpoint.id}
                className="flex flex-col border rounded-md p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{checkpoint.description}</h4>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(checkpoint.timestamp), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Message {checkpoint.messageIndex + 1} of {project.chatHistory.length}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleRestore(checkpoint.id)}
                >
                  Restore to this checkpoint
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
