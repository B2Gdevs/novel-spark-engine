
import { UnifiedChat } from "@/components/chat/UnifiedChat";

export function AssistantPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50 text-gray-900">
      <UnifiedChat mode="page" />
    </div>
  );
}
