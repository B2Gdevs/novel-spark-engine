
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/types/novel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";
import { CalendarIcon } from "lucide-react";
import { VersionHistory } from "./entity/VersionHistory";

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const { currentBook } = useNovel();
  
  // Get character names from IDs
  const characterNames = event.characters.map(id => {
    const character = currentBook?.characters.find(char => char.id === id);
    return character ? character.name : "Unknown";
  });

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-300/20 to-blue-300/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-600">{event.name}</CardTitle>
          <div className="text-xs flex items-center text-muted-foreground">
            <CalendarIcon size={12} className="mr-1" />
            {event.date || "Unknown date"}
          </div>
        </div>
        <CardDescription>Event</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm mb-3 line-clamp-2">{event.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {characterNames.map((name, index) => (
            <Badge key={index} variant="outline" className="bg-novel-lavender/10 border-novel-lavender">
              {name}
            </Badge>
          ))}
        </div>
        {event.consequences.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Consequences</h4>
            <ul className="list-disc list-inside text-sm">
              {event.consequences.map((consequence, index) => (
                <li key={index} className="text-muted-foreground">
                  {consequence}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50 dark:bg-zinc-800/50">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/events/${event.id}`}>Edit</Link>
          </Button>
          <VersionHistory 
            entityType="event"
            entityId={event.id}
            currentName={event.name}
          />
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => onDelete(event.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
