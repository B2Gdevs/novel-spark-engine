
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Scene } from "@/types/novel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";

interface SceneCardProps {
  scene: Scene;
  onDelete: (id: string) => void;
}

export function SceneCard({ scene, onDelete }: SceneCardProps) {
  const { currentBook } = useNovel();
  
  // Get character names from IDs
  const characterNames = scene.characters.map(id => {
    const character = currentBook?.characters.find(char => char.id === id);
    return character ? character.name : "Unknown";
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-novel-orange/20 to-novel-orange/5">
        <CardTitle className="text-novel-orange">{scene.title}</CardTitle>
        <CardDescription>{scene.location || "No location set"}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm mb-3 line-clamp-3">{scene.content.substring(0, 150)}...</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {characterNames.map((name, index) => (
            <Badge key={index} variant="outline" className="bg-novel-lavender/10 border-novel-lavender">
              {name}
            </Badge>
          ))}
        </div>
        {scene.tone && (
          <div className="mt-2">
            <Badge variant="secondary" className="bg-gray-100">
              Tone: {scene.tone}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/scenes/${scene.id}`}>Edit</Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(scene.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
