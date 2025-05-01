
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Book, Character, Page, Scene, Place } from "@/types/novel";
import { cn } from "@/lib/utils";

interface MarkdownMessageProps {
  content: string;
  onCreateEntity?: (entityType: string, entityData: any) => void;
  onUpdateEntity?: (entityType: string, entityId: string, entityData: any) => void;
  currentBook?: Book | null;
  className?: string;
}

export function MarkdownMessage({ 
  content, 
  onCreateEntity, 
  onUpdateEntity, 
  currentBook,
  className
}: MarkdownMessageProps) {
  const [entityData, setEntityData] = useState<{
    type: 'character' | 'scene' | 'place' | 'page';
    data: any;
    exists: boolean;
    id?: string;
  } | null>(null);

  useEffect(() => {
    // Parse content for entity patterns
    parseEntityFromContent(content);
  }, [content, currentBook]);

  const parseEntityFromContent = (content: string) => {
    // Check for character pattern
    const characterMatch = content.match(/\*\*Character:\s*([\w\s]+)\*\*/i);
    if (characterMatch) {
      const nameMatch = content.match(/\*\*Name:\*\*\s*([\w\s]+)/i);
      const traitsMatch = content.match(/\*\*Traits:\*\*\s*([^\n]+)/i);
      const descriptionMatch = content.match(/\*\*Description:\*\*\s*([^\n]+)/i);
      const roleMatch = content.match(/\*\*Role:\*\*\s*([^\n]+)/i);
      
      if (nameMatch) {
        const name = nameMatch[1].trim();
        
        // Check if character exists in current book
        const existingCharacter = currentBook?.characters.find(
          c => c.name.toLowerCase() === name.toLowerCase()
        );
        
        const characterData = {
          name,
          traits: traitsMatch ? traitsMatch[1].trim().split(/\s*,\s*/) : [],
          description: descriptionMatch ? descriptionMatch[1].trim() : "",
          role: roleMatch ? roleMatch[1].trim() : "",
        };
        
        setEntityData({
          type: 'character',
          data: characterData,
          exists: !!existingCharacter,
          id: existingCharacter?.id
        });
        
        return;
      }
    }
    
    // Check for scene pattern
    const sceneMatch = content.match(/\*\*Scene:\s*([\w\s]+)\*\*/i);
    if (sceneMatch) {
      const titleMatch = content.match(/\*\*Title:\*\*\s*([\w\s]+)/i);
      const descriptionMatch = content.match(/\*\*Description:\*\*\s*([^\n]+)/i);
      const locationMatch = content.match(/\*\*Location:\*\*\s*([^\n]+)/i);
      
      if (titleMatch) {
        const title = titleMatch[1].trim();
        
        // Check if scene exists in current book
        const existingScene = currentBook?.scenes.find(
          s => s.title.toLowerCase() === title.toLowerCase()
        );
        
        const sceneData = {
          title,
          description: descriptionMatch ? descriptionMatch[1].trim() : "",
          location: locationMatch ? locationMatch[1].trim() : "",
          characters: [],
          content: ""
        };
        
        setEntityData({
          type: 'scene',
          data: sceneData,
          exists: !!existingScene,
          id: existingScene?.id
        });
        
        return;
      }
    }
    
    // Check for page pattern
    const pageMatch = content.match(/\*\*Page:\s*([\w\s]+)\*\*/i);
    if (pageMatch) {
      const titleMatch = content.match(/\*\*Title:\*\*\s*([\w\s]+)/i);
      const contentMatch = content.match(/\*\*Content:\*\*\s*([^\n]+)/i);
      
      if (titleMatch) {
        const title = titleMatch[1].trim();
        
        // Check if page exists in current book
        const existingPage = currentBook?.pages.find(
          p => p.title.toLowerCase() === title.toLowerCase()
        );
        
        const pageData = {
          title,
          content: contentMatch ? contentMatch[1].trim() : "",
          order: currentBook?.pages.length || 0
        };
        
        setEntityData({
          type: 'page',
          data: pageData,
          exists: !!existingPage,
          id: existingPage?.id
        });
        
        return;
      }
    }
    
    // Check for place pattern
    const placeMatch = content.match(/\*\*Place:\s*([\w\s]+)\*\*/i);
    if (placeMatch) {
      const nameMatch = content.match(/\*\*Name:\*\*\s*([\w\s]+)/i);
      const descriptionMatch = content.match(/\*\*Description:\*\*\s*([^\n]+)/i);
      const geographyMatch = content.match(/\*\*Geography:\*\*\s*([^\n]+)/i);
      
      if (nameMatch) {
        const name = nameMatch[1].trim();
        
        // Check if place exists in current book
        const existingPlace = currentBook?.places?.find(
          p => p.name.toLowerCase() === name.toLowerCase()
        );
        
        const placeData = {
          name,
          description: descriptionMatch ? descriptionMatch[1].trim() : "",
          geography: geographyMatch ? geographyMatch[1].trim() : "",
        };
        
        setEntityData({
          type: 'place',
          data: placeData,
          exists: !!existingPlace,
          id: existingPlace?.id
        });
        
        return;
      }
    }
    
    // No entity patterns found
    setEntityData(null);
  };

  const handleCreateEntity = () => {
    if (entityData && onCreateEntity) {
      onCreateEntity(entityData.type, entityData.data);
    }
  };

  const handleUpdateEntity = () => {
    if (entityData && entityData.exists && entityData.id && onUpdateEntity) {
      onUpdateEntity(entityData.type, entityData.id, entityData.data);
    }
  };

  // Process content to highlight mentions
  const processContentWithMentions = (content: string) => {
    // This is a simplified version - we'd need more complex processing to actually highlight mentions
    // but this gives you an idea of how it would work
    return content;
  };

  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      <ReactMarkdown>{processContentWithMentions(content)}</ReactMarkdown>
      
      {entityData && (
        <div className="mt-4 p-3 bg-amber-900/30 border border-amber-500/30 rounded-lg">
          <p className="text-amber-200 font-medium mb-2">
            {entityData.exists 
              ? `Update this ${entityData.type}?` 
              : `Create a new ${entityData.type}?`}
          </p>
          
          <Button
            size="sm"
            variant="default"
            className={entityData.exists ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
            onClick={entityData.exists ? handleUpdateEntity : handleCreateEntity}
          >
            {entityData.exists ? `Update ${entityData.type}` : `Create ${entityData.type}`}
          </Button>
        </div>
      )}
    </div>
  );
}
