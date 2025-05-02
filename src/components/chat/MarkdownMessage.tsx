
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Book } from '@/types/novel';

interface EntityData {
  type: 'character' | 'scene' | 'page' | 'place';
  data: any;
  exists: boolean;
  id?: string;
}

interface MarkdownMessageProps {
  content: string;
  onCreateEntity: (entityType: string, entityData: any) => void;
  onUpdateEntity: (entityType: string, entityId: string, entityData: any) => void;
  currentBook: Book | null;
}

export function MarkdownMessage({ 
  content, 
  onCreateEntity, 
  onUpdateEntity,
  currentBook
}: MarkdownMessageProps) {
  // Use ref to prevent infinite loop
  const [processed, setProcessed] = useState(false);
  
  useEffect(() => {
    // Only process once per message
    if (processed || !content || !currentBook) return;
    
    const detectEntity = () => {
      // Character pattern detection
      if (content.includes('**Character:') || content.includes('**Character :')) {
        const characterMatch = content.match(/\*\*Character:?\s*([^*]+)\*\*/i);
        if (characterMatch) {
          const nameMatch = content.match(/\*\*Name:\*\*\s*([^\n]+)/i);
          const traitsMatch = content.match(/\*\*Traits:\*\*\s*([^\n]+)/i);
          const descriptionMatch = content.match(/\*\*Description:\*\*\s*([^\n]+)/i);
          const roleMatch = content.match(/\*\*Role:\*\*\s*([^\n]+)/i);
          
          if (nameMatch) {
            const name = nameMatch[1].trim();
            
            // Check if this character already exists
            const existingCharacter = currentBook.characters.find(
              c => c.name.toLowerCase() === name.toLowerCase()
            );
            
            const characterData = {
              name,
              traits: traitsMatch ? traitsMatch[1].split(',').map(t => t.trim()) : [],
              description: descriptionMatch ? descriptionMatch[1].trim() : '',
              role: roleMatch ? roleMatch[1].trim() : ''
            };
            
            if (existingCharacter) {
              onUpdateEntity('character', existingCharacter.id, characterData);
            } else {
              onCreateEntity('character', characterData);
            }
            
            return true;
          }
        }
      }
      
      // Scene pattern detection
      if (content.includes('**Scene:') || content.includes('**Scene :')) {
        const sceneMatch = content.match(/\*\*Scene:?\s*([^*]+)\*\*/i);
        if (sceneMatch) {
          const titleMatch = content.match(/\*\*Title:\*\*\s*([^\n]+)/i);
          const descriptionMatch = content.match(/\*\*Description:\*\*\s*([^\n]+)/i);
          const locationMatch = content.match(/\*\*Location:\*\*\s*([^\n]+)/i);
          
          if (titleMatch) {
            const title = titleMatch[1].trim();
            
            // Check if this scene already exists
            const existingScene = currentBook.scenes.find(
              s => s.title.toLowerCase() === title.toLowerCase()
            );
            
            const sceneData = {
              title,
              description: descriptionMatch ? descriptionMatch[1].trim() : '',
              location: locationMatch ? locationMatch[1].trim() : '',
              content: descriptionMatch ? descriptionMatch[1].trim() : '',
              characters: []
            };
            
            if (existingScene) {
              onUpdateEntity('scene', existingScene.id, sceneData);
            } else {
              onCreateEntity('scene', sceneData);
            }
            
            return true;
          }
        }
      }
      
      // Page pattern detection
      if (content.includes('**Page:') || content.includes('**Page :')) {
        const pageMatch = content.match(/\*\*Page:?\s*([^*]+)\*\*/i);
        if (pageMatch) {
          const titleMatch = content.match(/\*\*Title:\*\*\s*([^\n]+)/i);
          const contentMatch = content.match(/\*\*Content:\*\*\s*([^\n]+)/i);
          
          if (titleMatch) {
            const title = titleMatch[1].trim();
            
            // Check if this page already exists
            const existingPage = currentBook.pages.find(
              p => p.title.toLowerCase() === title.toLowerCase()
            );
            
            // Extract the content from the markdown, excluding the metadata section
            let pageContent = '';
            if (contentMatch) {
              pageContent = contentMatch[1].trim();
            } else {
              // Get the content from the markdown, excluding the metadata section
              const lines = content.split('\n');
              let metadataEndIndex = -1;
              
              // Find where metadata section ends
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() === '' && i > 2) {
                  metadataEndIndex = i;
                  break;
                }
              }
              
              if (metadataEndIndex > -1) {
                pageContent = lines.slice(metadataEndIndex + 1).join('\n').trim();
              }
            }
            
            const pageData = {
              title,
              content: pageContent || '',
              order: existingPage?.order || currentBook.pages.length
            };
            
            if (existingPage) {
              onUpdateEntity('page', existingPage.id, pageData);
            } else {
              onCreateEntity('page', pageData);
            }
            
            return true;
          }
        }
      }
      
      // Place pattern detection
      if (content.includes('**Place:') || content.includes('**Place :')) {
        const placeMatch = content.match(/\*\*Place:?\s*([^*]+)\*\*/i);
        if (placeMatch) {
          const nameMatch = content.match(/\*\*Name:\*\*\s*([^\n]+)/i);
          const descriptionMatch = content.match(/\*\*Description:\*\*\s*([^\n]+)/i);
          const geographyMatch = content.match(/\*\*Geography:\*\*\s*([^\n]+)/i);
          
          if (nameMatch) {
            const name = nameMatch[1].trim();
            
            // Check if this place already exists
            const existingPlace = currentBook.places?.find(
              p => p.name.toLowerCase() === name.toLowerCase()
            );
            
            const placeData = {
              name,
              description: descriptionMatch ? descriptionMatch[1].trim() : '',
              geography: geographyMatch ? geographyMatch[1].trim() : ''
            };
            
            if (existingPlace) {
              onUpdateEntity('place', existingPlace.id, placeData);
            } else {
              onCreateEntity('place', placeData);
            }
            
            return true;
          }
        }
      }
      
      return false;
    };
    
    // Process entities and mark as done to prevent infinite loops
    const entityDetected = detectEntity();
    setProcessed(true);
  }, [content, currentBook, onCreateEntity, onUpdateEntity, processed]);

  return (
    <div className="prose prose-zinc dark:prose-invert prose-sm w-full max-w-full prose-custom">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
