
import { useNovel } from "@/contexts/NovelContext";
import { UnifiedChat } from './chat/UnifiedChat';
import { CopilotActions } from "./chat/CopilotActions";

export function ChatInterface() {
  const { currentBook } = useNovel();

  return (
    <div className="bg-[#f3f3f3] h-full border-2 border-[#333] rounded-md shadow-sm">
      <CopilotActions />
      <UnifiedChat mode="dialog" />
    </div>
  );
}
