
import { useNovel } from "@/contexts/NovelContext";
import { UnifiedChat } from './chat/UnifiedChat';
import { CopilotActions } from "./chat/CopilotActions";

export function ChatInterface() {
  const { currentBook } = useNovel();

  return (
    <div className="bg-[#f8f8f8] dark:bg-[#1a1a1a] h-full border border-[#e0e0e0] dark:border-[#333] rounded-lg shadow-sm overflow-hidden">
      <CopilotActions />
      <UnifiedChat mode="dialog" />
    </div>
  );
}
