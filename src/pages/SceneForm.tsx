
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNovel } from "@/contexts/NovelContext";
import { Scene } from "@/types/novel";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function SceneForm() {
  const { addScene, updateScene, getScene, currentBook } = useNovel();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [scene, setScene] = useState<Partial<Scene>>({
    title: "",
    content: "",
    characters: [],
    location: "",
    events: [],
    tone: "",
  });
  
  const [selectedCharacter, setSelectedCharacter] = useState("");

  useEffect(() => {
    if (id === 'new') {
      const timestamp = new Date().toISOString();
      setScene({
        title: '',
        description: '',
        content: '',
        location: '',
        characters: [],
        notes: '',
        tone: '',
        createdAt: timestamp,
        updatedAt: timestamp
      });
    } else if (id && id !== "new") {
      const existingScene = getScene(id);
      if (existingScene) {
        setScene({
          title: existingScene.title,
          content: existingScene.content,
          characters: existingScene.characters || [],
          location: existingScene.location || "",
          events: existingScene.events || [],
          tone: existingScene.tone || "",
          description: existingScene.description,
          notes: existingScene.notes
        });
      }
    }
  }, [id, currentBook, getScene]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scene.title?.trim()) {
      toast.error("Scene title is required");
      return;
    }

    if (!scene.content?.trim()) {
      toast.error("Scene content is required");
      return;
    }

    const timestamp = new Date().toISOString();

    if (id && id !== "new") {
      updateScene(id, scene);
      toast.success("Scene updated successfully");
    } else {
      const newScene: Omit<Scene, "id"> = {
        title: scene.title || "",
        content: scene.content || "",
        description: scene.description,
        location: scene.location,
        characters: scene.characters || [],
        notes: scene.notes,
        tone: scene.tone,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      addScene(newScene);
      toast.success("Scene created successfully");
    }
    
    navigate("/scenes");
  };

  const handleAddCharacter = (characterId: string) => {
    if (!characterId || scene.characters?.includes(characterId)) {
      return;
    }
    
    setScene({
      ...scene,
      characters: [...(scene.characters || []), characterId],
    });
    setSelectedCharacter("");
  };

  const handleRemoveCharacter = (characterId: string) => {
    setScene({
      ...scene,
      characters: scene.characters?.filter(id => id !== characterId) || [],
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-novel-orange">
          {id && id !== "new" ? "Edit Scene" : "Create Scene"}
        </h1>
        <p className="text-muted-foreground">
          {id && id !== "new"
            ? "Update an existing scene in your story"
            : "Add a new scene to your story"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Scene Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={scene.title || ""}
                  onChange={(e) =>
                    setScene({ ...scene, title: e.target.value })
                  }
                  placeholder="Scene title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={scene.location || ""}
                  onChange={(e) =>
                    setScene({ ...scene, location: e.target.value })
                  }
                  placeholder="Where does this scene take place?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="characters">Characters in Scene</Label>
              <Select
                value={selectedCharacter}
                onValueChange={handleAddCharacter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add a character to this scene" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Characters</SelectLabel>
                    {currentBook?.characters.map((character) => (
                      <SelectItem
                        key={character.id}
                        value={character.id}
                        disabled={scene.characters?.includes(character.id)}
                      >
                        {character.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {scene.characters?.map((characterId) => {
                  const character = currentBook?.characters.find(c => c.id === characterId);
                  return character ? (
                    <Badge
                      key={characterId}
                      className="bg-novel-lavender/10 text-novel-purple border-novel-lavender hover:bg-novel-lavender/20"
                      onClick={() => handleRemoveCharacter(characterId)}
                    >
                      {character.name} ✕
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Scene Tone</Label>
              <Select
                value={scene.tone || ""}
                onValueChange={(value) => setScene({ ...scene, tone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tone for this scene" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tone</SelectLabel>
                    <SelectItem value="suspenseful">Suspenseful</SelectItem>
                    <SelectItem value="romantic">Romantic</SelectItem>
                    <SelectItem value="melancholic">Melancholic</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="tense">Tense</SelectItem>
                    <SelectItem value="dramatic">Dramatic</SelectItem>
                    <SelectItem value="mysterious">Mysterious</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="uplifting">Uplifting</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={scene.content || ""}
                onChange={(e) =>
                  setScene({ ...scene, content: e.target.value })
                }
                placeholder="Write your scene..."
                rows={10}
                className="font-mono"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/scenes")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-novel-orange hover:bg-novel-orange/90">
                {id && id !== "new" ? "Update Scene" : "Create Scene"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
