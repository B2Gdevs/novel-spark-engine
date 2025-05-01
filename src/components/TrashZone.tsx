
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrashZoneProps {
  isActive: boolean;
  onDrop: () => void;
}

export function TrashZone({ isActive, onDrop }: TrashZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

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

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "fixed bottom-10 right-10 w-20 h-20 rounded-full flex items-center justify-center transition-all",
        isDragOver 
          ? "bg-red-600 scale-125 shadow-lg" 
          : "bg-zinc-800 border-2 border-dashed border-zinc-600",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <Trash2 
          className={cn(
            "w-8 h-8 transition-all", 
            isDragOver ? "text-white" : "text-zinc-400"
          )} 
        />
        {isDragOver && (
          <div className="text-xs font-bold text-white mt-1">Drop to delete</div>
        )}
      </div>
    </div>
  );
}
