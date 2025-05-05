
import { UnifiedChat } from "@/components/chat/UnifiedChat";

export function AssistantPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-white text-gray-900">
      <UnifiedChat mode="page" />
    </div>
  );
}
