
import { useState } from 'react';
import { EntityVersion } from '@/types/novel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { useNovel } from '@/contexts/NovelContext';
import { HistoryIcon } from 'lucide-react';

interface VersionHistoryProps {
  entityType: 'character' | 'scene' | 'page' | 'place' | 'event';
  entityId: string;
  currentName?: string;
}

export function VersionHistory({ entityType, entityId, currentName }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const { project, restoreEntityVersion } = useNovel();
  
  const versions = project.entityVersions?.filter(
    v => v.entityType === entityType && v.entityId === entityId
  ) || [];
  
  // Sort versions by creation date (newest first)
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  if (sortedVersions.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <HistoryIcon className="mr-1 h-4 w-4" />
        No versions
      </Button>
    );
  }

  const handleRestore = (version: EntityVersion) => {
    restoreEntityVersion(version.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HistoryIcon className="mr-1 h-4 w-4" />
          History ({sortedVersions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)} "{currentName}" versions
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sortedVersions.map((version, index) => {
              const versionData = version.versionData;
              const name = versionData.name || versionData.title || 'Unnamed';
              const timeAgo = formatDistanceToNow(new Date(version.createdAt), { addSuffix: true });
              
              return (
                <Card key={version.id} className={index === 0 ? "border-green-500" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between">
                      <span>{name}</span>
                      <span className="text-sm text-muted-foreground">{timeAgo}</span>
                    </CardTitle>
                    <CardDescription>
                      {version.description || `Version from ${new Date(version.createdAt).toLocaleString()}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    {entityType === 'character' && (
                      <div className="space-y-1">
                        {versionData.description && <p>{versionData.description}</p>}
                        {versionData.role && <p><strong>Role:</strong> {versionData.role}</p>}
                        {versionData.age && <p><strong>Age:</strong> {versionData.age}</p>}
                      </div>
                    )}
                    {entityType === 'scene' && (
                      <div className="space-y-1">
                        {versionData.description && <p>{versionData.description}</p>}
                        {versionData.content && <p className="line-clamp-3">{versionData.content}</p>}
                      </div>
                    )}
                    {entityType === 'page' && (
                      <div className="space-y-1">
                        {versionData.content && <p className="line-clamp-3">{versionData.content}</p>}
                      </div>
                    )}
                    {entityType === 'place' && (
                      <div className="space-y-1">
                        {versionData.description && <p>{versionData.description}</p>}
                        {versionData.geography && <p><strong>Geography:</strong> {versionData.geography}</p>}
                      </div>
                    )}
                    {entityType === 'event' && (
                      <div className="space-y-1">
                        {versionData.description && <p>{versionData.description}</p>}
                        {versionData.date && <p><strong>Date:</strong> {versionData.date}</p>}
                        {versionData.impact && <p><strong>Impact:</strong> {versionData.impact}</p>}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleRestore(version)} 
                      variant={index === 0 ? "outline" : "default"}
                      disabled={index === 0}
                    >
                      {index === 0 ? "Current Version" : "Restore This Version"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
