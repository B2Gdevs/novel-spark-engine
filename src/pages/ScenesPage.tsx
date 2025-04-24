
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";
import { SceneCard } from "@/components/SceneCard";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function ScenesPage() {
  const { currentBook, deleteScene } = useNovel();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const scenes = currentBook?.scenes || [];

  const filteredScenes = scenes.filter(
    (scene) =>
      scene.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scene.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scene.location && scene.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteScene(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-500">Scenes</h1>
          <p className="text-muted-foreground">Build and manage the scenes in your story</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link to="/scenes/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Scene
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search scenes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenes.length > 0 ? (
          filteredScenes.map((scene) => (
            <SceneCard 
              key={scene.id} 
              scene={scene} 
              onDelete={(id) => setDeletingId(id)} 
            />
          ))
        ) : (
          <div className="col-span-full p-8 text-center bg-white dark:bg-zinc-800 rounded-lg border border-dashed">
            <h3 className="font-medium text-lg mb-2">No scenes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "No scenes match your search. Try a different search term."
                : "Get started by adding your first scene."}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link to="/scenes/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Scene
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scene</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this scene? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
