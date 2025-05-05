import { Book } from "@/types/novel";

/**
 * Process message text to extract and handle @ mentions
 */
export function processMentionsInMessage(
  text: string,
  searchEntities: (query: string) => Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    description?: string;
    bookId?: string;
    bookTitle?: string;
  }>,
  currentBook?: Book | null,
  getAllBooks?: () => Book[]
) {
  // Enhanced regex to catch both formats:
  // @type/name and @book/type/name
  const mentionRegex = /@(([^/]+)\/)?([a-z]+)\/([^@\s]+)/g;
  const mentions: Array<{
    type: 'character' | 'scene' | 'place' | 'page';
    id: string;
    name: string;
    fullText: string;
    bookId?: string;
    bookTitle?: string;
  }> = [];
  
  let lastIndex = 0;
  let processedText = '';
  let match: RegExpExecArray | null;
  
  // Reset the regex to start from the beginning
  mentionRegex.lastIndex = 0;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the match
    processedText += text.substring(lastIndex, match.index);
    
    const fullMatch = match[0]; // The entire @book/type/name or @type/name match
    const bookTitle = match[2]; // Optional book title (might be undefined)
    const entityType = match[3] as 'character' | 'scene' | 'place' | 'page';
    const entityName = match[4];
    
    // Determine which book to search in
    let targetBookId: string | undefined;
    let searchResults;
    
    if (bookTitle && getAllBooks) {
      // Cross-book reference
      const books = getAllBooks();
      const matchingBook = books.find(b => 
        b.title.toLowerCase() === bookTitle.toLowerCase()
      );
      
      if (matchingBook) {
        targetBookId = matchingBook.id;
        // Search in the specific book
        searchResults = searchEntities(`${entityType}/${entityName}`);
        // Filter to only results from that book
        searchResults = searchResults.filter(entity => entity.bookId === targetBookId);
      } else {
        // Book not found, search everywhere
        searchResults = searchEntities(`${entityType}/${entityName}`);
      }
    } else {
      // Normal reference, search current book first
      searchResults = searchEntities(`${entityType}/${entityName}`);
    }
    
    if (searchResults && searchResults.length > 0) {
      const entity = searchResults[0]; // Take the first match
      
      // Add this entity to our mentions list
      mentions.push({
        type: entityType,
        id: entity.id,
        name: entity.name,
        fullText: fullMatch,
        bookId: entity.bookId,
        bookTitle: entity.bookTitle
      });
      
      // Replace the @mention with just the name in the processed text
      processedText += entity.name;
    } else {
      // If entity not found, keep the original text
      processedText += fullMatch;
    }
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Add any remaining text
  processedText += text.substring(lastIndex);
  
  return {
    messageContent: processedText,
    mentionedEntities: mentions
  };
}

/**
 * Parse entities from a message and format them for the AI
 */
export function parseEntitiesFromMessage(
  message: string,
  bookId: string,
  bookTitle: string
) {
  // Extract mentions like @character/Kaelin or @scene/The Battle
  const mentionRegex = /@(character|scene|place|page)\/([^@\s]+)/g;
  const mentionedEntities: Array<{
    type: string;
    id: string;
    name: string;
  }> = [];
  
  // Process the message text
  const processedMessage = message.replace(mentionRegex, (match, type, name) => {
    // Generate a unique ID for each entity mention
    const fakeId = `${type}-${name}-${Date.now()}`;
    
    mentionedEntities.push({
      type,
      id: fakeId,
      name
    });
    
    // Replace with just the name in the processed message
    return name;
  });
  
  return {
    mentionedEntities,
    processedMessage
  };
}
