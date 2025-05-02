
import { supabase } from "@/integrations/supabase/client";
import { Book, Character, Scene, Place, Page, Event, Note, ChatMessage } from "@/types/novel";
import { toast } from "sonner";

// Helper to convert JavaScript dates to ISO strings for Supabase
const toISOString = (date: Date) => date.toISOString();

/**
 * Character sync functions
 */
export async function saveCharacterToSupabase(character: Character, bookId: string) {
  try {
    const { data, error } = await supabase
      .from('characters')
      .upsert({
        id: character.id,
        name: character.name,
        description: character.description,
        traits: character.traits || [],
        role: character.role,
        age: character.age,
        backstory: character.backstory,
        image_url: character.imageUrl,
        book_id: bookId,
        updated_at: toISOString(new Date())
      }, { onConflict: 'id' })
      .select();
      
    if (error) {
      console.error('Error saving character:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception saving character:', error);
    toast.error("Failed to save character to database");
    return null;
  }
}

/**
 * Scene sync functions
 */
export async function saveSceneToSupabase(scene: Scene, bookId: string) {
  try {
    const { data, error } = await supabase
      .from('scenes')
      .upsert({
        id: scene.id,
        title: scene.title,
        content: scene.content,
        description: scene.description,
        location: scene.location,
        characters: scene.characters || [],
        notes: scene.notes,
        book_id: bookId,
        updated_at: toISOString(new Date())
      }, { onConflict: 'id' })
      .select();
      
    if (error) {
      console.error('Error saving scene:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception saving scene:', error);
    toast.error("Failed to save scene to database");
    return null;
  }
}

/**
 * Place sync functions
 */
export async function savePlaceToSupabase(place: Place, bookId: string) {
  try {
    const { data, error } = await supabase
      .from('places')
      .upsert({
        id: place.id,
        name: place.name,
        description: place.description,
        geography: place.geography,
        cultural_notes: place.culturalNotes,
        book_id: bookId,
        updated_at: toISOString(new Date())
      }, { onConflict: 'id' })
      .select();
      
    if (error) {
      console.error('Error saving place:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception saving place:', error);
    toast.error("Failed to save place to database");
    return null;
  }
}

/**
 * Page sync functions
 */
export async function savePageToSupabase(page: Page, bookId: string) {
  try {
    const { data, error } = await supabase
      .from('pages')
      .upsert({
        id: page.id,
        title: page.title,
        content: page.content,
        book_id: bookId,
        updated_at: toISOString(new Date())
      }, { onConflict: 'id' })
      .select();
      
    if (error) {
      console.error('Error saving page:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception saving page:', error);
    toast.error("Failed to save page to database");
    return null;
  }
}

/**
 * Chat history sync functions
 */
export async function saveEntityChatHistory(
  entityType: string,
  entityId: string,
  bookId: string,
  chatMessages: ChatMessage[]
) {
  try {
    // First check if an entity chat record exists
    const { data: existingChat, error: fetchError } = await supabase
      .from('entity_chats')
      .select('id')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching entity chat:', fetchError);
      throw fetchError;
    }
    
    // Format chat messages for storage
    const formattedMessages = chatMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      entityType: msg.entityType,
      entityId: msg.entityId
    }));
    
    // Insert or update the entity chat
    const { data, error } = await supabase
      .from('entity_chats')
      .upsert({
        id: existingChat?.id || undefined,
        entity_type: entityType,
        entity_id: entityId,
        book_id: bookId,
        chat_history: formattedMessages,
        updated_at: toISOString(new Date())
      }, { onConflict: existingChat?.id ? 'id' : undefined })
      .select();
      
    if (error) {
      console.error('Error saving entity chat history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception saving entity chat history:', error);
    toast.error("Failed to save chat history to database");
    return null;
  }
}

/**
 * Fetch entity chat history
 */
export async function fetchEntityChatHistory(
  entityType: string,
  entityId: string
): Promise<ChatMessage[] | null> {
  try {
    const { data, error } = await supabase
      .from('entity_chats')
      .select('chat_history')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching entity chat history:', error);
      throw error;
    }
    
    // Type assertion to handle the JSON conversion
    if (data?.chat_history && Array.isArray(data.chat_history)) {
      // Use type casting with proper type checking
      const chatHistory = data.chat_history as any[];
      
      // Ensure all required properties exist on each message
      const validChatMessages = chatHistory.filter(msg => 
        msg && 
        typeof msg.id === 'string' && 
        typeof msg.role === 'string' && 
        typeof msg.content === 'string' && 
        typeof msg.timestamp === 'number'
      ) as ChatMessage[];
      
      return validChatMessages;
    }
    
    return null;
  } catch (error) {
    console.error('Exception fetching entity chat history:', error);
    toast.error("Failed to load chat history from database");
    return null;
  }
}

/**
 * Book summary sync
 */
export async function saveBookSummary(bookId: string, summary: string) {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({ summary })
      .eq('id', bookId)
      .select();
      
    if (error) {
      console.error('Error saving book summary:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception saving book summary:', error);
    toast.error("Failed to save book summary to database");
    return null;
  }
}
