
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Book } from '@/types/novel';

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
  const processedRef = useRef(false);
  
  useEffect(() => {
    // Only process once per content update
    if (processedRef.current || !content || !currentBook) return;
    
    const detectEntity = () => {
      // Extract entity patterns from content
      const entityPatterns = [
        {
          type: 'character',
          headerRegex: /\*\*Character:?\s*([^*]+)\*\*/i,
          fields: [
            { name: 'name', regex: /\*\*Name:\*\*\s*([^\n]+)/i },
            { name: 'traits', regex: /\*\*Traits:\*\*\s*([^\n]+)/i, isArray: true },
            { name: 'description', regex: /\*\*Description:\*\*\s*([^\n]+)/i },
            { name: 'role', regex: /\*\*Role:\*\*\s*([^\n]+)/i }
          ]
        },
        {
          type: 'scene',
          headerRegex: /\*\*Scene:?\s*([^*]+)\*\*/i,
          fields: [
            { name: 'title', regex: /\*\*Title:\*\*\s*([^\n]+)/i },
            { name: 'description', regex: /\*\*Description:\*\*\s*([^\n]+)/i },
            { name: 'location', regex: /\*\*Location:\*\*\s*([^\n]+)/i }
          ]
        },
        {
          type: 'page',
          headerRegex: /\*\*Page:?\s*([^*]+)\*\*/i,
          fields: [
            { name: 'title', regex: /\*\*Title:\*\*\s*([^\n]+)/i }
          ],
          contentKey: 'content',
          // For page, we need special handling to extract content
          contentExtractor: (text: string) => {
            // Get title from the markdown
            const titleMatch = text.match(/\*\*Title:\*\*\s*([^\n]+)/i);
            const title = titleMatch ? titleMatch[1].trim() : '';
            
            // First, find the "Content:" marker if it exists
            const contentMarkerMatch = text.match(/\*\*Content:\*\*\s*/i);
            if (contentMarkerMatch) {
              // Extract everything after the content marker
              const contentStart = text.indexOf(contentMarkerMatch[0]) + contentMarkerMatch[0].length;
              return text.substring(contentStart).trim();
            } else {
              // If no Content marker, extract everything after the metadata section
              const lines = text.split('\n');
              let metadataEndLine = 0;
              
              // Find the title line
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes("**Title:**")) {
                  metadataEndLine = i;
                  break;
                }
              }
              
              // Look for a blank line after title to find the end of metadata
              let contentStartLine = metadataEndLine + 1;
              while (contentStartLine < lines.length && lines[contentStartLine].trim() !== '') {
                contentStartLine++;
              }
              
              // Skip the blank line
              contentStartLine++;
              
              // Join everything from there to the end as the content
              return lines.slice(contentStartLine).join('\n').trim();
            }
          }
        },
        {
          type: 'place',
          headerRegex: /\*\*Place:?\s*([^*]+)\*\*/i,
          fields: [
            { name: 'name', regex: /\*\*Name:\*\*\s*([^\n]+)/i },
            { name: 'description', regex: /\*\*Description:\*\*\s*([^\n]+)/i },
            { name: 'geography', regex: /\*\*Geography:\*\*\s*([^\n]+)/i }
          ]
        }
      ];

      // Try to match each entity pattern
      for (const pattern of entityPatterns) {
        const headerMatch = content.match(pattern.headerRegex);
        
        if (headerMatch) {
          // Extract field values using regex
          const entityData: Record<string, any> = {};
          
          // Process standard fields
          for (const field of pattern.fields) {
            const match = content.match(field.regex);
            if (match) {
              if (field.isArray) {
                entityData[field.name] = match[1].split(',').map(item => item.trim());
              } else {
                entityData[field.name] = match[1].trim();
              }
            } else {
              entityData[field.name] = field.isArray ? [] : '';
            }
          }
          
          // Special handling for content field (used for pages)
          if (pattern.contentKey && pattern.contentExtractor) {
            entityData[pattern.contentKey] = pattern.contentExtractor(content);
          }
          
          // For scenes, ensure we have a content field derived from description
          if (pattern.type === 'scene' && entityData.description) {
            entityData.content = entityData.content || entityData.description;
            entityData.characters = entityData.characters || [];
          }
          
          // Add default order value for pages
          if (pattern.type === 'page') {
            entityData.order = currentBook.pages.length;
          }
          
          // Check if entity already exists
          let existingEntity;
          let nameKey = pattern.type === 'scene' || pattern.type === 'page' ? 'title' : 'name';
          
          switch (pattern.type) {
            case 'character':
              existingEntity = currentBook.characters.find(
                c => c.name.toLowerCase() === entityData.name.toLowerCase()
              );
              break;
            case 'scene':
              existingEntity = currentBook.scenes.find(
                s => s.title.toLowerCase() === entityData.title.toLowerCase()
              );
              break;
            case 'page':
              existingEntity = currentBook.pages.find(
                p => p.title.toLowerCase() === entityData.title.toLowerCase()
              );
              break;
            case 'place':
              existingEntity = currentBook.places?.find(
                p => p.name.toLowerCase() === entityData.name.toLowerCase()
              );
              break;
          }
          
          // Create or update entity
          if (existingEntity) {
            onUpdateEntity(pattern.type, existingEntity.id, entityData);
          } else {
            onCreateEntity(pattern.type, entityData);
          }
          
          return true; // Entity detected and processed
        }
      }
      
      return false; // No entity detected
    };
    
    // Process entities and mark as done
    detectEntity();
    processedRef.current = true;
  }, [content, currentBook, onCreateEntity, onUpdateEntity]);

  // Reset the processed flag when content changes
  useEffect(() => {
    processedRef.current = false;
  }, [content]);

  return (
    <div className="prose prose-zinc dark:prose-invert prose-sm w-full max-w-full prose-custom">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
