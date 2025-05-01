
import { useNovel } from "@/contexts/NovelContext";
import { toast } from "sonner";

interface EntityProcessorProps {
  type: 'character' | 'scene' | 'page' | 'place';
  data: any;
  exists: boolean;
  id?: string;
  onEntityProcessed: () => void;
}

export function EntityProcessor({ 
  type, 
  data, 
  exists, 
  id,
  onEntityProcessed 
}: EntityProcessorProps) {
  const { 
    addCharacter, 
    updateCharacter, 
    addScene,
    updateScene,
    addPage,
    updatePage,
    addPlace,
    updatePlace,
    addChatMessage
  } = useNovel();

  const handleCreateEntity = () => {
    try {
      let newId: string | undefined;
      let successMessage = '';
      
      switch (type) {
        case 'character':
          newId = addCharacter(data);
          successMessage = `Character "${data.name}" created successfully`;
          break;
        case 'scene':
          newId = addScene(data);
          successMessage = `Scene "${data.title}" created successfully`;
          break;
        case 'page':
          newId = addPage(data);
          successMessage = `Page "${data.title}" created successfully`;
          break;
        case 'place':
          newId = addPlace(data);
          successMessage = `Place "${data.name}" created successfully`;
          break;
      }
      
      // Add confirmation message to chat
      if (newId) {
        addChatMessage({
          role: 'system',
          content: successMessage,
          entityType: type,
          entityId: newId
        });
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
          updateCharacter(id, data);
          successMessage = `Character updated successfully`;
          break;
        case 'scene':
          updateScene(id, data);
          successMessage = `Scene updated successfully`;
          break;
        case 'page':
          updatePage(id, data);
          successMessage = `Page updated successfully`;
          break;
        case 'place':
          updatePlace(id, data);
          successMessage = `Place updated successfully`;
          break;
      }
      
      // Add confirmation message to chat
      addChatMessage({
        role: 'system',
        content: successMessage,
        entityType: type,
        entityId: id
      });
      
      toast.success(successMessage);
      onEntityProcessed();
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      toast.error(`Failed to update ${type}`);
    }
  };

  return null;
}
