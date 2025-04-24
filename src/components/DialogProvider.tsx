
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";

interface DialogProviderProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

export function DialogProvider({ children, open, onOpenChange, title }: DialogProviderProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] bg-zinc-800 border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <div className="h-full overflow-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
