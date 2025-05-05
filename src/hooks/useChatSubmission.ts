
import { useState } from 'react';
import { ChatMessage, Book } from '@/types/novel';
import { useNovel } from '@/contexts/NovelContext';
import { processMentionsInMessage } from '@/components/chat/MentionUtils';
import { toast } from 'sonner';

interface ChatSubmissionProps {
  linkedEntityType: string | null;
  linkedEntityId: string | null;
  currentBook: Book | null;
}

export function useChatSubmission({ 
  linkedEntityType, 
  linkedEntityId,
  currentBook
}: ChatSubmissionProps) {
  const { 
    addChatMessage, 
    sendMessageToAI, 
    findEntitiesByPartialName,
    createChatCheckpoint
  } = useNovel();
  const [loading, setLoading] = useState(false);

  // Handler that processes message, detects entity mentions, and sends message to AI
  const handleSubmit = async (message: string) => {
    if (!message.trim()) return;
    if (!currentBook) {
      toast.error("No book selected, please select a book first");
      return;
    }
    
    setLoading(true);
    
    try {
      // Detect mentioned entities in the user message using the processMentionsInMessage function
      const { messageContent, mentionedEntities } = processMentionsInMessage(
        message,
        (query) => findEntitiesByPartialName(query, ['character', 'scene', 'page', 'place']),
        currentBook
      );
      
      // Add user message to chat history
      addChatMessage({
        role: 'user',
        content: messageContent,
        mentionedEntities: mentionedEntities.map(entity => ({
          id: entity.id,
          type: entity.type,
          name: entity.name
        }))
      });
      
      // If linked to an entity, include that context
      let systemPrompt = `You are a creative writing assistant helping with a book titled "${currentBook.title}".`;
      
      if (linkedEntityType && linkedEntityId) {
        systemPrompt += ` This conversation is specifically about the ${linkedEntityType} with ID: ${linkedEntityId}.`;
      }
      
      // Add specific instructions for the AI assistant to use actions
      systemPrompt += ` When asked to create, modify, or manage characters, scenes, places, or pages, use the provided actions:
      - createCharacter: Use this to create new characters
      - createScene: Use this to create new scenes
      - createPlace: Use this to create new places
      - createPage: Use this to create new pages
      
      If the user mentions an entity with @, make sure to reference it in your response properly. 
      After creating entities, confirm their creation and store them in the database automatically.`;
      
      // Create an array of mentioned entities in the format expected by sendMessageToAI
      const mentionedEntitiesForAI = mentionedEntities.map(entity => ({
        type: entity.type,
        id: entity.id,
        name: entity.name
      }));
      
      // Send message to AI assistant
      const aiResponse = await sendMessageToAI(
        messageContent, 
        [...(linkedEntityType && linkedEntityId ? [] : []), ...mentionedEntitiesForAI], 
        systemPrompt
      );
            
      // Add AI response to chat history
      if (aiResponse.success && aiResponse.message) {
        addChatMessage({
          role: 'assistant',
          content: aiResponse.message
        });
        
        // Create checkpoint after successful AI response (for recovery if needed)
        createChatCheckpoint(`Checkpoint after message: ${messageContent.substring(0, 30)}...`);
      } else {
        // Add error message if AI failed to respond
        addChatMessage({
          role: 'system',
          content: `Error: ${aiResponse.error || 'Failed to get response'}` 
        });
        toast.error("Failed to get AI response");
      }
    } catch (error) {
      console.error("Error in chat submission:", error);
      toast.error("Error processing your message");
      
      // Add error system message
      addChatMessage({
        role: 'system',
        content: `Error processing message: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    loading,
    findEntitiesByPartialName
  };
}
