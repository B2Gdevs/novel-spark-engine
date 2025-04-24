
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";

export function HomePage() {
  const { project, currentBook } = useNovel();

  const characterCount = currentBook?.characters.length || 0;
  const sceneCount = currentBook?.scenes.length || 0;
  const eventCount = currentBook?.events.length || 0;
  const noteCount = currentBook?.notes.length || 0;

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold text-novel-purple">Welcome to NovelSpark</h1>
        <p className="text-xl text-muted-foreground">Your AI-powered novel writing assistant</p>
      </div>
      
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto mb-6">
            <div className="h-24 w-24 bg-novel-purple/10 flex items-center justify-center rounded-full mx-auto">
              <span className="text-4xl">✨</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Your Novel at a Glance</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-novel-purple">{characterCount}</div>
              <div className="text-sm text-gray-500">Characters</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-novel-orange">{sceneCount}</div>
              <div className="text-sm text-gray-500">Scenes</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-500">{eventCount}</div>
              <div className="text-sm text-gray-500">Events</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-500">{noteCount}</div>
              <div className="text-sm text-gray-500">Notes</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button asChild variant="default" size="lg" className="bg-novel-purple hover:bg-novel-purple/90">
              <Link to="/characters">Manage Characters</Link>
            </Button>
            <Button asChild variant="default" size="lg" className="bg-novel-orange hover:bg-novel-orange/90">
              <Link to="/scenes">Work on Scenes</Link>
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Need inspiration or help?</h3>
            <p className="text-sm mb-4">Ask our AI assistant to help with character development, scene ideas, or plot points.</p>
            <Button asChild variant="outline" className="border-novel-purple text-novel-purple hover:bg-novel-purple/10">
              <Link to="/assistant">Chat with AI Assistant</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Create, organize, and develop your novel with the power of AI</p>
      </div>
    </div>
  );
}
