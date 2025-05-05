
import { useCopilotAction, useCopilotContext } from '@copilotkit/react-core';
import { useNovel } from '@/contexts/NovelContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

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
        
        // Add character and get the ID
        const newId = addCharacter(characterData);
        
        if (newId) {
          toast.success(`Character "${characterData.name}" created successfully`);
          return { 
            success: true, 
            message: `Character ${characterData.name} created successfully with ID: ${newId}`,
            character: { id: newId, ...characterData }
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
        
        // Add scene and get the ID
        const newId = addScene(sceneData);
        
        if (newId) {
          toast.success(`Scene "${sceneData.title}" created successfully`);
          return { 
            success: true, 
            message: `Scene ${sceneData.title} created successfully with ID: ${newId}`,
            scene: { id: newId, ...sceneData }
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
        
        // Add place and get the ID
        const newId = addPlace(placeData);
        
        if (newId) {
          toast.success(`Place "${placeData.name}" created successfully`);
          return { 
            success: true, 
            message: `Place ${placeData.name} created successfully with ID: ${newId}`,
            place: { id: newId, ...placeData }
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
        
        // Add page and get the ID
        const newId = addPage(pageData);
        
        if (newId) {
          toast.success(`Page "${pageData.title}" created successfully`);
          return { 
            success: true, 
            message: `Page ${pageData.title} created successfully with ID: ${newId}`,
            page: { id: newId, ...pageData }
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
