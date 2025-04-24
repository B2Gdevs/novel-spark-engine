
import { ChatInterface } from "@/components/ChatInterface";
import { NovelProvider } from "@/contexts/NovelContext";

export function HomePage() {
  return (
    <div className="p-6">
      <div className="space-y-4 max-w-4xl mx-auto">
        <ChatInterface />
      </div>
    </div>
  );
}
