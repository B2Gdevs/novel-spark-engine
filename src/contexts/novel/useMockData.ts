
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { NovelProject } from "@/types/novel";

export function useMockData(setProject: React.Dispatch<React.SetStateAction<NovelProject>>) {
  const addMockData = useCallback(() => {
    setProject(prev => {
      // Ensure prev.books is an array before proceeding
      const prevBooks = Array.isArray(prev.books) ? prev.books : [];
      
      // Check if we need to add mock data
      if (prevBooks.length === 0 || 
          (prevBooks[0] && (!prevBooks[0].characters || prevBooks[0].characters.length === 0))) {
        
        const mockCharacters = [
          {
            id: uuidv4(),
            name: "Kael Windrunner",
            age: 27,
            description: "A brooding and mysterious mage with a dark past",
            traits: ["intelligent", "secretive", "powerful"],
            backstory: "Exiled from his homeland after a magical accident, Kael seeks redemption while hiding his true identity.",
            imageUrl: "",
            role: "Protagonist",
            secrets: [],
            relationships: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: uuidv4(),
            name: "Lyra Dawnbringer",
            age: 24,
            description: "A valiant paladin devoted to her cause",
            traits: ["brave", "righteous", "stubborn"],
            backstory: "Born to a noble family, Lyra abandoned her inheritance to pursue a life of service to the light.",
            imageUrl: "",
            role: "Ally",
            secrets: [],
            relationships: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        const mockScenes = [
          {
            id: uuidv4(),
            title: "The Awakening",
            description: "Kael discovers his latent magical powers after a violent confrontation",
            content: "The forest grew quiet as Kael felt the power surge through his veins...",
            location: "Mistwood Forest",
            characters: [mockCharacters[0].id],
            notes: "Key moment in Kael's character development",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: uuidv4(),
            title: "Oath of Protection",
            description: "Lyra swears to protect the village from the oncoming darkness",
            content: "Standing before the altar, Lyra raised her sword to the heavens...",
            location: "Temple of Light",
            characters: [mockCharacters[1].id],
            notes: "Establishes Lyra's primary motivation",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        const mockEvents = [
          {
            id: uuidv4(),
            name: "The Great Cataclysm",
            description: "A magical disaster that shattered the old kingdom",
            date: "10 years before story begins",
            impact: "Created the world as it exists now, with magic being feared and distrusted",
            characters: [],
            consequences: ["The rise of the Anti-Magic League", "The scattering of the Royal Family"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        let updatedBooks = [...prevBooks];
        if (updatedBooks.length === 0) {
          const newBook = {
            id: uuidv4(),
            title: "The Dark Mage's Redemption",
            description: "A tale of magic, betrayal, and redemption",
            genre: "Fiction",
            characters: mockCharacters,
            scenes: mockScenes,
            events: mockEvents,
            notes: [],
            pages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          updatedBooks.push(newBook);
        } else {
          const book = updatedBooks[0];
          updatedBooks[0] = {
            ...book,
            characters: [...(Array.isArray(book.characters) ? book.characters : []), ...mockCharacters],
            scenes: [...(Array.isArray(book.scenes) ? book.scenes : []), ...mockScenes],
            events: [...(Array.isArray(book.events) ? book.events : []), ...mockEvents]
          };
        }
        
        return {
          ...prev,
          books: updatedBooks,
          currentBookId: updatedBooks[0]?.id || null
        };
      }
      
      return prev;
    });
  }, [setProject]);

  return { addMockData };
}
