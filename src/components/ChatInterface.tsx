
import { useNovel } from "@/contexts/NovelContext";
import { UnifiedChat } from './chat/UnifiedChat';
import { CopilotActions } from "./chat/CopilotActions";
import { CopilotProvider } from "./chat/CopilotProvider";

export function ChatInterface() {
  const { currentBook } = useNovel();

  return (
    <CopilotProvider>
      <div className="bg-background border rounded-lg shadow-sm overflow-hidden h-full">
        <CopilotActions />
        <UnifiedChat mode="dialog" />
      </div>
    </CopilotProvider>
  );
}
