
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNovel } from "@/contexts/NovelContext";
import { Event } from "@/types/novel";
import { Checkbox } from "@/components/ui/checkbox";

export function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBook, addEvent, updateEvent, getEvent } = useNovel();
  const [event, setEvent] = useState<Partial<Event>>({
    name: '',
    description: '',
    characters: [],
    consequences: [],
    date: ''
  });
  const [availableCharacters, setAvailableCharacters] = useState<{ id: string; name: string; }[]>([]);

  useEffect(() => {
    if (currentBook) {
      setAvailableCharacters(currentBook.characters.map(char => ({ id: char.id, name: char.name })));
    }
  }, [currentBook]);

  useEffect(() => {
    if (id === 'new') {
      const timestamp = new Date().toISOString();
      setEvent({
        name: '',
        description: '',
        characters: [],
        consequences: [],
        date: '',
        createdAt: timestamp,
        updatedAt: timestamp
      });
    } else {
      if (currentBook && id) {
        const existingEvent = getEvent(id);
        if (existingEvent) {
          setEvent(existingEvent);
        } else {
          // Handle the case where the event is not found
          console.error(`Event with id ${id} not found`);
          // Optionally, navigate back or show an error message
          navigate('/events');
        }
      }
    }
  }, [id, currentBook, getEvent, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEvent(prevEvent => ({
      ...prevEvent,
      [name]: value
    }));
  };

  const handleCharacterChange = (characterId: string, checked: boolean) => {
    setEvent(prevEvent => {
      const characters = prevEvent.characters || [];
      let updatedCharacters = [...characters];
      if (checked) {
        updatedCharacters.push(characterId);
      } else {
        updatedCharacters = updatedCharacters.filter(id => id !== characterId);
      }
      return { ...prevEvent, characters: updatedCharacters };
    });
  };

  const handleConsequencesChange = (index: number, value: string) => {
    const consequences = event.consequences || [];
    const updatedConsequences = [...consequences];
    updatedConsequences[index] = value;
    setEvent(prevEvent => ({ ...prevEvent, consequences: updatedConsequences }));
  };

  const addConsequence = () => {
    setEvent(prevEvent => ({
      ...prevEvent,
      consequences: [...(prevEvent.consequences || []), '']
    }));
  };

  const removeConsequence = (index: number) => {
    const consequences = event.consequences || [];
    const updatedConsequences = [...consequences];
    updatedConsequences.splice(index, 1);
    setEvent(prevEvent => ({ ...prevEvent, consequences: updatedConsequences }));
  };

  const saveEvent = () => {
    const timestamp = new Date().toISOString();
    
    if (id === 'new') {
      const newEvent: Omit<Event, 'id'> = {
        name: event.name || '',
        description: event.description,
        characters: event.characters || [],
        consequences: event.consequences || [],
        date: event.date,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      addEvent(newEvent);
      navigate('/events');
    } else if (id) {
      updateEvent(id, { 
        ...event,
        updatedAt: timestamp
      });
      navigate('/events');
    }
  };

  if (!currentBook) {
    return <div>Please select a book first.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{id === 'new' ? 'Create Event' : 'Edit Event'}</CardTitle>
          <CardDescription>
            {id === 'new' ? 'Add a new event to your novel.' : 'Edit the details of an existing event.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={event.name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="text"
              id="date"
              name="date"
              value={event.date || ''}
              onChange={handleInputChange}
              placeholder="e.g., August 12, 1995"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={event.description || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label>Characters</Label>
            <div className="flex flex-wrap gap-2">
              {availableCharacters.map(character => (
                <div key={character.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`character-${character.id}`}
                    checked={event.characters?.includes(character.id) || false}
                    onCheckedChange={(checked) => handleCharacterChange(character.id, !!checked)}
                  />
                  <Label htmlFor={`character-${character.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {character.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Consequences</Label>
            {(event.consequences || []).map((consequence, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  type="text"
                  value={consequence}
                  onChange={(e) => handleConsequencesChange(index, e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => removeConsequence(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addConsequence}>
              Add Consequence
            </Button>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => navigate('/events')}>
              Cancel
            </Button>
            <Button onClick={saveEvent}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
