
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNovel } from "@/contexts/NovelContext";
import { Event } from "@/types/novel";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function EventForm() {
  const { addEvent, updateEvent, getEvent, currentBook } = useNovel();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [event, setEvent] = useState<Omit<Event, "id">>({
    name: "",
    description: "",
    characters: [],
    consequences: [],
    date: format(new Date(), "PPP"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [newConsequence, setNewConsequence] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (id && id !== "new") {
      const existingEvent = getEvent(id);
      if (existingEvent) {
        setEvent({
          name: existingEvent.name,
          description: existingEvent.description || "",
          characters: existingEvent.characters || [],
          consequences: existingEvent.consequences || [],
          date: existingEvent.date || format(new Date(), "PPP"),
          createdAt: existingEvent.createdAt,
          updatedAt: new Date().toISOString()
        });
        
        // Try to parse the date if it exists
        try {
          const parsedDate = new Date(existingEvent.date || "");
          if (!isNaN(parsedDate.getTime())) {
            setDate(parsedDate);
          }
        } catch (e) {
          console.error("Failed to parse date:", e);
        }
      }
    }
  }, [id, getEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event.name.trim()) {
      toast.error("Event name is required");
      return;
    }

    if (!event.description.trim()) {
      toast.error("Event description is required");
      return;
    }

    const finalEvent = {
      ...event,
      date: date ? format(date, "PPP") : format(new Date(), "PPP"),
    };

    if (id && id !== "new") {
      updateEvent(id, finalEvent);
      toast.success("Event updated successfully");
    } else {
      addEvent(finalEvent);
      toast.success("Event created successfully");
    }
    
    navigate("/events");
  };

  const handleAddCharacter = (characterId: string) => {
    if (!characterId || event.characters.includes(characterId)) {
      return;
    }
    
    setEvent({
      ...event,
      characters: [...event.characters, characterId],
    });
    setSelectedCharacter("");
  };

  const handleRemoveCharacter = (characterId: string) => {
    setEvent({
      ...event,
      characters: event.characters.filter(id => id !== characterId),
    });
  };

  const handleAddConsequence = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newConsequence.trim()) {
      e.preventDefault();
      setEvent({
        ...event,
        consequences: [...event.consequences, newConsequence.trim()],
      });
      setNewConsequence("");
    }
  };

  const handleRemoveConsequence = (index: number) => {
    const updatedConsequences = [...event.consequences];
    updatedConsequences.splice(index, 1);
    setEvent({
      ...event,
      consequences: updatedConsequences,
    });
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setEvent({
        ...event,
        date: format(selectedDate, "PPP"),
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          {id && id !== "new" ? "Edit Event" : "Create Event"}
        </h1>
        <p className="text-muted-foreground">
          {id && id !== "new"
            ? "Update an existing event in your story"
            : "Add a new pivotal event to your story"}
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
          <CardTitle className="text-xl">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={event.name}
                onChange={(e) =>
                  setEvent({ ...event, name: e.target.value })
                }
                placeholder="E.g. The Great Battle, The Wedding, The Betrayal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date in Story</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={event.description}
                onChange={(e) =>
                  setEvent({ ...event, description: e.target.value })
                }
                placeholder="Describe what happens during this event..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="characters">Characters Involved</Label>
              <Select
                value={selectedCharacter}
                onValueChange={handleAddCharacter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add a character to this event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Characters</SelectLabel>
                    {currentBook?.characters.map((character) => (
                      <SelectItem
                        key={character.id}
                        value={character.id}
                        disabled={event.characters.includes(character.id)}
                      >
                        {character.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {event.characters.map((characterId) => {
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
              <Label htmlFor="consequences">Consequences (Press Enter to add)</Label>
              <Input
                id="consequences"
                value={newConsequence}
                onChange={(e) => setNewConsequence(e.target.value)}
                onKeyDown={handleAddConsequence}
                placeholder="What changes as a result of this event?"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {event.consequences.map((consequence, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    onClick={() => handleRemoveConsequence(index)}
                  >
                    {consequence} ✕
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/events")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {id && id !== "new" ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
