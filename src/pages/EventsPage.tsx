
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search, CalendarIcon, ListIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";
import { EventCard } from "@/components/EventCard";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event } from "@/types/novel";

export function EventsPage() {
  const { currentBook, deleteEvent } = useNovel();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

  // Create a function to sort events by date
  const getSortedEvents = () => {
    const events = currentBook?.events || [];
    
    return [...events].sort((a, b) => {
      // Try to parse dates
      const dateA = new Date(a.date || "");
      const dateB = new Date(b.date || "");
      
      // If both are valid dates, compare them
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // If dates are invalid, sort by name
      return a.name.localeCompare(b.name);
    });
  };
  
  const events = getSortedEvents();

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.consequences.some((consequence) =>
        consequence.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteEvent(deletingId);
      setDeletingId(null);
    }
  };
  
  // Group events by year (or "Unknown" if no date)
  const groupEventsByYear = (events: Event[]) => {
    const groups: Record<string, Event[]> = {};
    
    events.forEach(event => {
      let year = "Unknown";
      if (event.date) {
        // Try to extract year from date
        const dateObj = new Date(event.date);
        if (!isNaN(dateObj.getTime())) {
          year = dateObj.getFullYear().toString();
        } else if (event.date.includes("Year")) {
          // Try to extract "Year X" format
          const match = event.date.match(/Year (\d+)/i);
          if (match && match[1]) {
            year = `Year ${match[1]}`;
          } else {
            // For fictional dates like "3rd Era, 214"
            year = event.date;
          }
        } else {
          year = event.date;
        }
      }
      
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(event);
    });
    
    return groups;
  };
  
  const groupedEvents = groupEventsByYear(filteredEvents);
  
  // Sort years for timeline
  const sortedYears = Object.keys(groupedEvents).sort((a, b) => {
    // Extract numbers from years if possible
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // If can't extract numbers, sort lexicographically
    return a.localeCompare(b);
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-500">Events</h1>
          <p className="text-muted-foreground">Build and manage the events in your story</p>
        </div>
        <Button asChild className="bg-blue-500 hover:bg-blue-600">
          <Link to="/events/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Tabs defaultValue="grid" value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "timeline")}>
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-1">
              <ListIcon className="h-4 w-4" /> Grid
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" /> Timeline
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onDelete={(id) => setDeletingId(id)} 
              />
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-white dark:bg-zinc-800 rounded-lg border border-dashed">
              <h3 className="font-medium text-lg mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No events match your search. Try a different search term."
                  : "Get started by adding your first event."}
              </p>
              {!searchTerm && (
                <Button asChild className="bg-blue-500 hover:bg-blue-600">
                  <Link to="/events/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Event
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Left timeline line */}
          <div className="absolute left-24 top-8 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-900 z-0" />
          
          {sortedYears.length > 0 ? (
            <div className="space-y-8">
              {sortedYears.map(year => (
                <div key={year} className="relative z-10">
                  {/* Year marker */}
                  <div className="flex items-center mb-4">
                    <div className="w-24 text-right pr-6">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{year}</span>
                    </div>
                    <div className="bg-blue-500 w-5 h-5 rounded-full border-4 border-white dark:border-zinc-900" />
                  </div>
                  
                  {/* Events for this year */}
                  <div className="space-y-4 ml-[116px]">
                    {groupedEvents[year].map(event => (
                      <Card key={event.id} className="relative max-w-2xl hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg text-blue-600">{event.name}</h3>
                            <span className="text-xs text-muted-foreground">{event.date}</span>
                          </div>
                          <p className="text-sm">{event.description}</p>
                          
                          {event.consequences.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium">Consequences:</h4>
                              <ul className="list-disc list-inside text-sm mt-1">
                                {event.consequences.map((consequence, idx) => (
                                  <li key={idx} className="text-muted-foreground">{consequence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="flex justify-end mt-3 gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/events/${event.id}`}>Edit</Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setDeletingId(event.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-zinc-800 rounded-lg border border-dashed mt-8">
              <h3 className="font-medium text-lg mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No events match your search. Try a different search term."
                  : "Get started by adding your first event."}
              </p>
              {!searchTerm && (
                <Button asChild className="bg-blue-500 hover:bg-blue-600">
                  <Link to="/events/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Event
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this event? This action cannot be undone.</p>
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
