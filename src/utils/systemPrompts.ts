
import { Book, ChatMessage } from '@/types/novel';

/**
 * Generates a base system prompt for chat interactions based on the current book
 */
export function generateBaseSystemPrompt(currentBook: Book): string {
  return `
    You are an AI assistant specialized in helping writers develop their novels.
    You're helpful, creative, and supportive. You focus on craft, world building, character development, and plot coherence.
    
    The user is currently working on a book titled "${currentBook.title}" with:
    - ${currentBook.characters.length} characters
    - ${currentBook.scenes.length} scenes
    - ${currentBook.events.length} events
    - ${currentBook.places?.length || 0} places
    - ${currentBook.pages.length} pages
    - ${currentBook.notes.length} notes
    - ${currentBook.summary || 'No summary yet'}
    
    When creating or updating characters, scenes, pages or places, format them as follows:
    
    For characters:
    **Character: [Name]**
    - **Name:** Full name
    - **Traits:** Trait1, Trait2, Trait3
    - **Description:** Physical appearance and notable features
    - **Role:** Character's role in the story
    
    For scenes:
    **Scene: [Title]**
    - **Title:** Scene title
    - **Description:** Brief description of what happens
    - **Location:** Where the scene takes place
    
    For pages:
    **Page: [Title]**
    - **Title:** Page title
    - **Content:** Brief content summary
    
    For places:
    **Place: [Name]**
    - **Name:** Place name
    - **Description:** Brief description
    - **Geography:** Notable geographic features

    Use Markdown formatting in your responses.
  `;
}

/**
 * Adds entity-specific context to the system prompt
 */
export function addEntityContextToPrompt(
  basePrompt: string, 
  entityType: string | null, 
  entityData: any
): string {
  if (!entityType || !entityData) return basePrompt;

  let entityPrompt = basePrompt;
  entityPrompt += `\n\nThis conversation is specifically about the ${entityType} "${entityData.name || entityData.title}".`;
  
  // Add specific details based on entity type
  switch (entityType) {
    case 'character':
      entityPrompt += `\nCurrent traits: ${entityData.traits?.join(', ') || 'None'}.
      Current description: ${entityData.description || 'None'}.
      Current role: ${entityData.role || 'None'}.`;
      break;
    case 'scene':
      entityPrompt += `\nCurrent description: ${entityData.description || 'None'}.
      Current location: ${entityData.location || 'None'}.`;
      break;
    case 'page':
      entityPrompt += `\nCurrent content: ${
        entityData.content ? 
        (entityData.content.length > 200 ? entityData.content.substring(0, 200) + '...' : entityData.content) 
        : 'None'
      }.`;
      break;
    case 'place':
      entityPrompt += `\nCurrent description: ${entityData.description || 'None'}.
      Current geography: ${entityData.geography || 'None'}.`;
      break;
  }
  
  return entityPrompt;
}

/**
 * Adds mentioned entities context to the system prompt
 */
export function addMentionedEntitiesToPrompt(
  basePrompt: string,
  mentionedEntities: Array<{
    type: string;
    id: string;
    name: string;
    bookId?: string;
    bookTitle?: string;
  }>,
  getEntityInfo: (type: string, id: string, bookId?: string) => any,
  currentBookId?: string
): string {
  if (!mentionedEntities || mentionedEntities.length === 0) return basePrompt;

  let mentionsPrompt = basePrompt;
  mentionsPrompt += "\n\nThe user's message mentions these entities:";
  
  mentionedEntities.forEach(entity => {
    const entityData = getEntityInfo(entity.type, entity.id, entity.bookId);
    if (entityData) {
      mentionsPrompt += `\n- ${entity.type} "${entityData.name || entityData.title}": `;
      
      switch(entity.type) {
        case 'character':
          mentionsPrompt += `${entityData.description || 'No description'}, Role: ${entityData.role || 'Unknown'}`;
          break;
        case 'scene':
          mentionsPrompt += `${entityData.description || 'No description'}, Location: ${entityData.location || 'Unknown'}`;
          break;
        case 'page':
          mentionsPrompt += entityData.content?.substring(0, 100) || 'No content';
          break;
        case 'place':
          mentionsPrompt += `${entityData.description || 'No description'}, Geography: ${entityData.geography || 'Unknown'}`;
          break;
      }
      
      if (entity.bookId && entity.bookId !== currentBookId) {
        mentionsPrompt += ` (from book: ${entity.bookTitle})`;
      }
    }
  });
  
  mentionsPrompt += "\n\nUse this entity information to provide context to your response.";
  return mentionsPrompt;
}

/**
 * Generates the complete system prompt for AI interactions based on the current context
 */
export function generateSystemPrompt(
  currentBook: Book,
  linkedEntityType: string | null,
  linkedEntityId: string | null,
  mentionedEntities: Array<{
    type: string;
    id: string;
    name: string;
    bookId?: string;
    bookTitle?: string;
  }> = [],
  getEntityInfo: (type: string, id: string, bookId?: string) => any
): string {
  // Generate the base system prompt
  let systemPrompt = generateBaseSystemPrompt(currentBook);
  
  // Add entity-specific context if linked to an entity
  if (linkedEntityType && linkedEntityId) {
    const entityData = getEntityInfo(linkedEntityType, linkedEntityId);
    if (entityData) {
      systemPrompt = addEntityContextToPrompt(systemPrompt, linkedEntityType, entityData);
    }
  }
  
  // Add mentioned entities context
  if (mentionedEntities.length > 0) {
    systemPrompt = addMentionedEntitiesToPrompt(
      systemPrompt, 
      mentionedEntities, 
      getEntityInfo, 
      currentBook.id
    );
  }
  
  return systemPrompt;
}
