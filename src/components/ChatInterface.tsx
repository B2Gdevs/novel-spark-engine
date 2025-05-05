
import { useNovel } from "@/contexts/NovelContext";
import { UnifiedChat } from './chat/UnifiedChat';

export function ChatInterface() {
  const { currentBook } = useNovel();

  return (
    <div className="bg-[#f3f3f3] h-full border-2 border-[#333] rounded-md shadow-sm">
      <UnifiedChat mode="dialog" />
    </div>
  );
}
