
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Note } from "@/types/novel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-300/20 to-green-300/5">
        <CardTitle className="text-green-600">{note.title}</CardTitle>
        <CardDescription>Note</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm mb-3 line-clamp-3">{note.content.substring(0, 150)}...</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-green-100 text-green-700 border-green-200">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/notes/${note.id}`}>Edit</Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(note.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
