
import { NovelProject } from "@/types/novel";
import { toast } from "sonner";

type SendMessageFunction = (
  message: string, 
  chatHistory: any[], 
  systemPrompt?: string
) => Promise<{ success: boolean; message?: string; error?: string }>;

export function useSummaryOperations(
  project: NovelProject,
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>,
  sendMessageToAI: SendMessageFunction
) {
  // Generate a summary for a book using the AI
  const generateBookSummary = async (bookId: string) => {
    const book = project.books.find(b => b.id === bookId);
    if (!book) {
      toast.error("Book not found");
      return null;
    }
    
    toast.info("Generating book summary...");
    
    try {
      // Create a detailed prompt that includes all book entities
      const prompt = `
        Please generate a comprehensive summary for my book titled "${book.title}".
        
        Current book details:
        - Genre: ${book.genre || "Not specified"}
        - Description: ${book.description || "Not provided"}
        
        Characters (${book.characters.length}):
        ${book.characters.map(c => `- ${c.name}: ${c.description || "No description"} (${c.role || "No role"})`).join("\n")}
        
        Scenes (${book.scenes.length}):
        ${book.scenes.map(s => `- ${s.title}: ${s.description || "No description"}`).join("\n")}
        
        Places (${book.places?.length || 0}):
        ${book.places?.map(p => `- ${p.name}: ${p.description || "No description"}`).join("\n") || "None"}
        
        Events (${book.events.length}):
        ${book.events.map(e => `- ${e.name}: ${e.description || "No description"}`).join("\n")}
        
        Please create a well-structured summary that includes:
        1. A compelling hook or introduction (1-2 paragraphs)
        2. Main plot points and narrative arc
        3. Key character relationships and developments
        4. Thematic elements
        5. A concluding paragraph that captures the essence of the story
        
        The summary should be comprehensive but concise (around 500-800 words).
      `;
      
      // Call the AI
      const result = await sendMessageToAI(prompt, [], 
        `You are a professional book editor and literary consultant. Your task is to create a polished, 
        well-structured summary of the author's book based on their provided details. Use professional 
        writing techniques to craft a compelling summary that captures the essence of their story.`
      );
      
      if (result.success && result.message) {
        // Update the book with the new summary
        setProject(prev => ({
          ...prev,
          books: prev.books.map(b => {
            if (b.id === bookId) {
              return {
                ...b,
                summary: result.message,
                updatedAt: new Date().toISOString()
              };
            }
            return b;
          })
        }));
        
        toast.success("Book summary generated successfully");
        return result.message;
      } else {
        toast.error("Failed to generate summary");
        return null;
      }
    } catch (error) {
      console.error("Error generating book summary:", error);
      toast.error("Failed to generate book summary");
      return null;
    }
  };
  
  return {
    generateBookSummary
  };
}
