
import { useNovel } from "@/contexts/NovelContext";
import { UnifiedChat } from './chat/UnifiedChat';

export function ChatInterface() {
  const { currentBook } = useNovel();

  return (
    <div className="bg-white h-full border border-gray-200 rounded-md shadow-sm">
      <UnifiedChat mode="dialog" />
    </div>
  );
}
