
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from "@/types/novel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
}

export function CharacterCard({ character, onDelete }: CharacterCardProps) {
  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-900 text-white shadow-lg hover:shadow-xl transition-all">
      <CardHeader className="bg-gradient-to-r from-[#9b87f5]/30 to-[#9b87f5]/10 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-[#9b87f5]">{character.name}</CardTitle>
            <CardDescription className="text-zinc-400">{character.role}</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className="bg-[#9b87f5]/20 text-[#D6BCFA] border-[#9b87f5]/50"
          >
            Character
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-zinc-300 mb-3">{character.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {character.traits && character.traits.map((trait, index) => (
            <Badge key={index} 
              className="bg-[#9b87f5]/10 text-[#D6BCFA] border-[#9b87f5]/30 border">
              {trait}
            </Badge>
          ))}
        </div>
        {character.secrets && character.secrets.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1 text-zinc-300">Secrets</h4>
            <ul className="list-disc list-inside">
              {character.secrets.map((secret, index) => (
                <li key={index} className="text-sm italic text-zinc-400">
                  {secret}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-zinc-800 pt-3 bg-zinc-950/50">
        <Button 
          variant="ghost"
          size="sm" 
          className="text-[#9b87f5] hover:text-[#D6BCFA] hover:bg-[#9b87f5]/10 flex items-center gap-1"
          asChild
        >
          <Link to={`/characters/${character.id}`}>
            <Edit size={14} />
            <span>Edit</span>
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-1"
          onClick={() => onDelete(character.id)}
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
