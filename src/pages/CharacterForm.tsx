
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNovel } from "@/contexts/NovelContext";
import { Character } from "@/types/novel";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function CharacterForm() {
  const { addCharacter, updateCharacter, getCharacter } = useNovel();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [character, setCharacter] = useState<Omit<Character, "id">>({
    name: "",
    traits: [],
    description: "",
    role: "",
    secrets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [newTrait, setNewTrait] = useState("");
  const [newSecret, setNewSecret] = useState("");

  useEffect(() => {
    if (id && id !== "new") {
      const existingCharacter = getCharacter(id);
      if (existingCharacter) {
        setCharacter({
          name: existingCharacter.name,
          traits: existingCharacter.traits || [],
          description: existingCharacter.description || "",
          role: existingCharacter.role || "",
          secrets: existingCharacter.secrets || [],
          relationships: existingCharacter.relationships,
          createdAt: existingCharacter.createdAt,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }, [id, getCharacter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!character.name.trim()) {
      toast.error("Character name is required");
      return;
    }

    if (id && id !== "new") {
      updateCharacter(id, character);
      toast.success("Character updated successfully");
    } else {
      addCharacter(character);
      toast.success("Character created successfully");
    }
    
    navigate("/characters");
  };

  const handleAddTrait = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTrait.trim()) {
      e.preventDefault();
      setCharacter({
        ...character,
        traits: [...character.traits, newTrait.trim()],
      });
      setNewTrait("");
    }
  };

  const handleRemoveTrait = (index: number) => {
    const updatedTraits = [...character.traits];
    updatedTraits.splice(index, 1);
    setCharacter({
      ...character,
      traits: updatedTraits,
    });
  };

  const handleAddSecret = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSecret.trim()) {
      e.preventDefault();
      setCharacter({
        ...character,
        secrets: [...(character.secrets || []), newSecret.trim()],
      });
      setNewSecret("");
    }
  };

  const handleRemoveSecret = (index: number) => {
    const updatedSecrets = [...(character.secrets || [])];
    updatedSecrets.splice(index, 1);
    setCharacter({
      ...character,
      secrets: updatedSecrets,
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-novel-purple">
          {id && id !== "new" ? "Edit Character" : "Create Character"}
        </h1>
        <p className="text-muted-foreground">
          {id && id !== "new"
            ? "Update the details of an existing character"
            : "Add a new character to your story"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Character Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={character.name}
                  onChange={(e) =>
                    setCharacter({ ...character, name: e.target.value })
                  }
                  placeholder="Character name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={character.role}
                  onChange={(e) =>
                    setCharacter({ ...character, role: e.target.value })
                  }
                  placeholder="E.g. Protagonist, Villain, Mentor"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={character.description}
                onChange={(e) =>
                  setCharacter({ ...character, description: e.target.value })
                }
                placeholder="Describe your character..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="traits">Traits (Press Enter to add)</Label>
              <Input
                id="traits"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyDown={handleAddTrait}
                placeholder="E.g. Brave, Intelligent, Short-tempered"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {character.traits.map((trait, index) => (
                  <Badge
                    key={index}
                    className="bg-novel-lavender/10 text-novel-purple border-novel-lavender hover:bg-novel-lavender/20"
                    onClick={() => handleRemoveTrait(index)}
                  >
                    {trait} ✕
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secrets">Secrets (Press Enter to add)</Label>
              <Input
                id="secrets"
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                onKeyDown={handleAddSecret}
                placeholder="Hidden motivations or backstory elements..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {character.secrets?.map((secret, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    onClick={() => handleRemoveSecret(index)}
                  >
                    {secret} ✕
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/characters")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-novel-purple hover:bg-novel-purple/90">
                {id && id !== "new" ? "Update Character" : "Create Character"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
