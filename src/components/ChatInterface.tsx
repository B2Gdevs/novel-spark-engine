
import { useNovel } from "@/contexts/NovelContext";
import { UnifiedChat } from './chat/UnifiedChat';

export function ChatInterface() {
  const { currentBook } = useNovel();

  return <UnifiedChat mode="dialog" />;
}
