
import { useCopilotAction } from '@copilotkit/react-core';
import { useNovel } from '@/contexts/NovelContext';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Character, Scene, Page, Place } from '@/types/novel';

export function CopilotActions() {
  const { 
    addCharacter, 
    updateCharacter, 
    addScene, 
    updateScene, 
    addPage, 
    updatePage, 
    addPlace, 
    updatePlace,
    currentBook
  } = useNovel();

  // Register action to create or update a character
  useCopilotAction({
    name: 'createCharacter',
    description: 'Create a new character in the current book',
    parameters: [
      {
        name: 'characterData',
        type: 'object',
        description: 'Character data to create',
        properties: {
          name: { type: 'string', description: 'The name of the character' },
          description: { type: 'string', description: 'Description of the character' },
          traits: { type: 'array', items: { type: 'string' }, description: 'Character traits' },
          role: { type: 'string', description: 'The role of the character' },
          backstory: { type: 'string', description: 'The backstory of the character' },
          secrets: { type: 'array', items: { type: 'string' }, description: 'Character secrets' }
        },
        required: ['name'],
      },
    ],
    handler: ({ characterData }) => {
      try {
        if (!currentBook) {
          return { success: false, error: 'No book selected' };
        }
        
        // Type assertion to access properties safely
        const data = characterData as Record<string, any>;
        
        // Cast the data to the correct type and ensure all required properties
        const typedCharacterData: Omit<Character, "id"> = {
          name: String(data.name || ''),
          description: data.description ? String(data.description) : undefined,
          traits: Array.isArray(data.traits) ? data.traits.map(String) : [],
          role: data.role ? String(data.role) : undefined,
          backstory: data.backstory ? String(data.backstory) : undefined,
          secrets: Array.isArray(data.secrets) ? data.secrets.map(String) : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add character and get the ID
        const newId = addCharacter(typedCharacterData);
        
        if (newId) {
          toast.success(`Character "${typedCharacterData.name}" created successfully`);
          return { 
            success: true, 
            message: `Character ${typedCharacterData.name} created successfully with ID: ${newId}`,
            character: { id: newId, ...typedCharacterData }
          };
        } else {
          return { success: false, error: 'Failed to create character' };
        }
      } catch (error) {
        console.error('Error creating character:', error);
        return { success: false, error: String(error) };
      }
    },
  });

  // Register action to create or update a scene
  useCopilotAction({
    name: 'createScene',
    description: 'Create a new scene in the current book',
    parameters: [
      {
        name: 'sceneData',
        type: 'object',
        description: 'Scene data to create',
        properties: {
          title: { type: 'string', description: 'The title of the scene' },
          description: { type: 'string', description: 'Description of the scene' },
          content: { type: 'string', description: 'Scene content' },
          characters: { type: 'array', items: { type: 'string' }, description: 'Character IDs in this scene' },
          location: { type: 'string', description: 'Location of the scene' }
        },
        required: ['title'],
      },
    ],
    handler: ({ sceneData }) => {
      try {
        if (!currentBook) {
          return { success: false, error: 'No book selected' };
        }
        
        // Type assertion to access properties safely
        const data = sceneData as Record<string, any>;
        
        // Cast the data to the correct type and ensure all required properties
        const typedSceneData: Omit<Scene, "id"> = {
          title: String(data.title || ''),
          description: data.description ? String(data.description) : undefined,
          content: data.content ? String(data.content) : undefined,
          characters: Array.isArray(data.characters) ? data.characters.map(String) : [],
          location: data.location ? String(data.location) : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add scene and get the ID
        const newId = addScene(typedSceneData);
        
        if (newId) {
          toast.success(`Scene "${typedSceneData.title}" created successfully`);
          return { 
            success: true, 
            message: `Scene ${typedSceneData.title} created successfully with ID: ${newId}`,
            scene: { id: newId, ...typedSceneData }
          };
        } else {
          return { success: false, error: 'Failed to create scene' };
        }
      } catch (error) {
        console.error('Error creating scene:', error);
        return { success: false, error: String(error) };
      }
    },
  });

  // Register action to create or update a place
  useCopilotAction({
    name: 'createPlace',
    description: 'Create a new place in the current book',
    parameters: [
      {
        name: 'placeData',
        type: 'object',
        description: 'Place data to create',
        properties: {
          name: { type: 'string', description: 'The name of the place' },
          description: { type: 'string', description: 'Description of the place' },
          geography: { type: 'string', description: 'Geographic details' },
          cultural_notes: { type: 'string', description: 'Cultural information about the place' }
        },
        required: ['name'],
      },
    ],
    handler: ({ placeData }) => {
      try {
        if (!currentBook) {
          return { success: false, error: 'No book selected' };
        }
        
        // Type assertion to access properties safely
        const data = placeData as Record<string, any>;
        
        // Cast the data to the correct type and ensure all required properties
        const typedPlaceData: Omit<Place, "id"> = {
          name: String(data.name || ''),
          description: data.description ? String(data.description) : undefined,
          geography: data.geography ? String(data.geography) : undefined,
          culturalNotes: data.cultural_notes ? String(data.cultural_notes) : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add place and get the ID
        const newId = addPlace(typedPlaceData);
        
        if (newId) {
          toast.success(`Place "${typedPlaceData.name}" created successfully`);
          return { 
            success: true, 
            message: `Place ${typedPlaceData.name} created successfully with ID: ${newId}`,
            place: { id: newId, ...typedPlaceData }
          };
        } else {
          return { success: false, error: 'Failed to create place' };
        }
      } catch (error) {
        console.error('Error creating place:', error);
        return { success: false, error: String(error) };
      }
    },
  });

  // Register action to create or update a page
  useCopilotAction({
    name: 'createPage',
    description: 'Create a new page in the current book',
    parameters: [
      {
        name: 'pageData',
        type: 'object',
        description: 'Page data to create',
        properties: {
          title: { type: 'string', description: 'The title of the page' },
          content: { type: 'string', description: 'Page content' }
        },
        required: ['title'],
      },
    ],
    handler: ({ pageData }) => {
      try {
        if (!currentBook) {
          return { success: false, error: 'No book selected' };
        }
        
        // Type assertion to access properties safely
        const data = pageData as Record<string, any>;
        
        // Cast the data to the correct type and ensure all required properties
        const typedPageData: Omit<Page, "id"> = {
          title: String(data.title || ''),
          content: data.content ? String(data.content) : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add page and get the ID
        const newId = addPage(typedPageData);
        
        if (newId) {
          toast.success(`Page "${typedPageData.title}" created successfully`);
          return { 
            success: true, 
            message: `Page ${typedPageData.title} created successfully with ID: ${newId}`,
            page: { id: newId, ...typedPageData }
          };
        } else {
          return { success: false, error: 'Failed to create page' };
        }
      } catch (error) {
        console.error('Error creating page:', error);
        return { success: false, error: String(error) };
      }
    },
  });

  return null;
}
