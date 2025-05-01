
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrashBinDialog } from './TrashBinDialog';

interface TrashZoneProps {
  onDrop: () => void;
  draggedItemExists: boolean;
}

export function TrashZone({ onDrop, draggedItemExists }: TrashZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showTrashBin, setShowTrashBin] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop();
  };

  const handleClick = () => {
    setShowTrashBin(true);
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-10 right-10 w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer",
          isDragOver 
            ? "bg-red-600 scale-125 shadow-lg" 
            : draggedItemExists
              ? "bg-zinc-800 border-2 border-zinc-600"
              : "bg-zinc-800/60 border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Trash2 
            className={cn(
              "w-8 h-8 transition-all", 
              isDragOver ? "text-white" : draggedItemExists ? "text-zinc-400" : "text-zinc-500/70"
            )} 
          />
          {isDragOver && (
            <div className="text-xs font-bold text-white mt-1">Drop to delete</div>
          )}
        </div>
      </div>
      
      <TrashBinDialog open={showTrashBin} onOpenChange={setShowTrashBin} />
    </>
  );
}
