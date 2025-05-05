
import { useNovel } from "@/contexts/NovelContext";
import { UnifiedChat } from './chat/UnifiedChat';

export function ChatInterface() {
  const { currentBook } = useNovel();

  return (
    <div className="bg-gray-50 h-full border border-gray-300 rounded-md shadow-sm">
      <UnifiedChat mode="dialog" />
    </div>
  );
}
