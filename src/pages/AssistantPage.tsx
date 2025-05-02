
import { UnifiedChat } from "@/components/chat/UnifiedChat";

export function AssistantPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-zinc-900 text-white">
      <UnifiedChat mode="page" />
    </div>
  );
}
