
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";
import { saveCharacterToSupabase, saveSceneToSupabase, savePageToSupabase, savePlaceToSupabase } from "@/services/supabase-sync";

interface EntityProcessorProps {
  type: 'character' | 'scene' | 'page' | 'place';
  data: any;
  exists: boolean;
  id?: string;
  messageId?: string; // Add message ID for versioning
  onEntityProcessed: () => void;
}

export function EntityProcessor({ 
  type, 
  data, 
  exists, 
  id,
  messageId,
  onEntityProcessed 
}: EntityProcessorProps) {
  const { 
    project,
    addCharacter, 
    updateCharacter, 
    addScene,
    updateScene,
    addPage,
    updatePage,
    addPlace,
    updatePlace,
    addChatMessage,
    addEntityVersion
  } = useNovel();

  const handleCreateEntity = () => {
    try {
      let newId: string | undefined;
      let successMessage = '';
      
      switch (type) {
        case 'character':
          newId = addCharacter(data, messageId);
          successMessage = `Character "${data.name}" created successfully`;
          break;
        case 'scene':
          newId = addScene(data, messageId);
          successMessage = `Scene "${data.title}" created successfully`;
          break;
        case 'page':
          newId = addPage(data, messageId);
          successMessage = `Page "${data.title}" created successfully`;
          break;
        case 'place':
          newId = addPlace(data, messageId);
          successMessage = `Place "${data.name}" created successfully`;
          break;
      }
      
      // Add confirmation message to chat
      if (newId) {
        addChatMessage({
          role: 'system',
          content: successMessage,
          entityType: type,
          entityId: newId,
          entityAction: 'create'
        });
        
        // Save to Supabase in background if we have a current book
        if (project.currentBookId && newId) {
          const saveToDb = async () => {
            try {
              switch (type) {
                case 'character':
                  await saveCharacterToSupabase({id: newId, ...data}, project.currentBookId!);
                  break;
                case 'scene':
                  await saveSceneToSupabase({id: newId, ...data}, project.currentBookId!);
                  break;
                case 'page':
                  await savePageToSupabase({id: newId, ...data}, project.currentBookId!);
                  break;
                case 'place':
                  await savePlaceToSupabase({id: newId, ...data}, project.currentBookId!);
                  break;
              }
            } catch (error) {
              console.error(`Error saving ${type} to database:`, error);
            }
          };
          
          saveToDb();
        }
      }
      
      toast.success(successMessage);
      onEntityProcessed();
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      toast.error(`Failed to create ${type}`);
    }
  };

  const handleUpdateEntity = () => {
    if (!id) return;
    
    try {
      let successMessage = '';
      
      switch (type) {
        case 'character':
          updateCharacter(id, data, messageId);
          successMessage = `Character updated successfully`;
          
          // Save to Supabase in background
          if (project.currentBookId) {
            saveCharacterToSupabase({id, ...data}, project.currentBookId)
              .catch(error => console.error("Failed to sync character update to database:", error));
          }
          break;
        case 'scene':
          updateScene(id, data, messageId);
          successMessage = `Scene updated successfully`;
          
          // Save to Supabase in background
          if (project.currentBookId) {
            saveSceneToSupabase({id, ...data}, project.currentBookId)
              .catch(error => console.error("Failed to sync scene update to database:", error));
          }
          break;
        case 'page':
          updatePage(id, data, messageId);
          successMessage = `Page updated successfully`;
          
          // Save to Supabase in background
          if (project.currentBookId) {
            savePageToSupabase({id, ...data}, project.currentBookId)
              .catch(error => console.error("Failed to sync page update to database:", error));
          }
          break;
        case 'place':
          updatePlace(id, data, messageId);
          successMessage = `Place updated successfully`;
          
          // Save to Supabase in background
          if (project.currentBookId) {
            savePlaceToSupabase({id, ...data}, project.currentBookId)
              .catch(error => console.error("Failed to sync place update to database:", error));
          }
          break;
      }
      
      // Add confirmation message to chat
      addChatMessage({
        role: 'system',
        content: successMessage,
        entityType: type,
        entityId: id,
        entityAction: 'update'
      });
      
      toast.success(successMessage);
      onEntityProcessed();
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      toast.error(`Failed to update ${type}`);
    }
  };

  // Execute the appropriate operation based on whether the entity exists
  if (exists && id) {
    handleUpdateEntity();
  } else {
    handleCreateEntity();
  }

  return null;
}
