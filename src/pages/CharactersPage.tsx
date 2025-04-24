
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";
import { CharacterCard } from "@/components/CharacterCard";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function CharactersPage() {
  const { currentBook, deleteCharacter } = useNovel();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const characters = currentBook?.characters || [];

  const filteredCharacters = characters.filter(
    (character) =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.traits.some((trait) =>
        trait.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteCharacter(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-600">Characters</h1>
          <p className="text-muted-foreground">Build and manage the characters in your story</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link to="/characters/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Character
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search characters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharacters.length > 0 ? (
          filteredCharacters.map((character) => (
            <CharacterCard 
              key={character.id} 
              character={character} 
              onDelete={(id) => setDeletingId(id)} 
            />
          ))
        ) : (
          <div className="col-span-full p-8 text-center bg-white dark:bg-zinc-800 rounded-lg border border-dashed">
            <h3 className="font-medium text-lg mb-2">No characters found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "No characters match your search. Try a different search term."
                : "Get started by adding your first character."}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/characters/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Character
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Character</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this character? This action cannot be undone.</p>
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
