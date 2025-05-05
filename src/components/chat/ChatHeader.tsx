
import { Book } from "@/types/novel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, TrashIcon, LinkIcon } from "lucide-react";

interface ChatHeaderProps {
  currentBook: Book | null;
  linkedEntityType: string | null;
  linkedEntityId: string | null;
  onClearChat: () => void;
  onClose?: () => void;
}

export function ChatHeader({
  currentBook,
  linkedEntityType,
  linkedEntityId,
  onClearChat,
  onClose
}: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-200 p-3 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center gap-2">
        {linkedEntityType && linkedEntityId ? (
          <div className="flex items-center text-sm">
            <LinkIcon size={14} className="mr-1 text-blue-500" />
            <span className="font-medium text-gray-700">
              Chatting with: {linkedEntityType.charAt(0).toUpperCase() + linkedEntityType.slice(1)}
            </span>
          </div>
        ) : (
          <span className="text-lg font-medium text-gray-800">
            {currentBook?.title || "Chat"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          disabled={Boolean(linkedEntityType && linkedEntityId)}
          title={
            linkedEntityType && linkedEntityId
              ? "Can't clear chat while linked to an entity"
              : "Clear chat history"
          }
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
        
        {onClose && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
