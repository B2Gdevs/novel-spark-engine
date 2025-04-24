
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from "@/types/novel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
}

export function CharacterCard({ character, onDelete }: CharacterCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-novel-purple/20 to-novel-purple/5">
        <CardTitle className="text-novel-purple">{character.name}</CardTitle>
        <CardDescription>{character.role}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm mb-3">{character.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {character.traits.map((trait, index) => (
            <Badge key={index} variant="outline" className="bg-novel-lavender/10 text-novel-purple border-novel-lavender">
              {trait}
            </Badge>
          ))}
        </div>
        {character.secrets && character.secrets.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Secrets</h4>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {character.secrets.map((secret, index) => (
                <li key={index} className="text-sm italic text-muted-foreground">
                  {secret}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/characters/${character.id}`}>Edit</Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(character.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
