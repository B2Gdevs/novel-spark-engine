
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useNovel } from "@/contexts/NovelContext";
import { EventCard } from "@/components/EventCard";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function EventsPage() {
  const { project, deleteEvent } = useNovel();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredEvents = project.events.filter(
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Events</h1>
          <p className="text-muted-foreground">Create and manage the major events in your story</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/events/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Event
          </Link>
        </Button>
      </div>

      <div className="max-w-xl">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
      </div>

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
          <div className="col-span-full p-8 text-center bg-white rounded-lg border border-dashed">
            <h3 className="font-medium text-lg mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "No events match your search. Try a different search term."
                : "Get started by adding your first event."}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/events/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Event
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

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
