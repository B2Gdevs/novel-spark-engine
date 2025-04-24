
import { ChatMessage } from "@/types/novel";
import { toast } from "sonner";

// In a real application, this would be securely stored on the server
// This is just for demo purposes and would need proper implementation
// in a production environment
const apiKey = ""; // Will be entered by user

export interface OpenAIResponse {
  text: string;
  success: boolean;
  error?: string;
}

export async function sendToOpenAI(
  messages: ChatMessage[],
  systemPrompt: string = "You are a helpful AI assistant for fiction writers."
): Promise<OpenAIResponse> {
  if (!apiKey) {
    return {
      text: "API key is not set. Please set your OpenAI API key in the settings.",
      success: false,
      error: "API key is not set"
    };
  }

  try {
    // Format messages for OpenAI
    const formattedMessages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: formattedMessages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      toast.error(`Error: ${error.error?.message || "Failed to connect to OpenAI"}`);
      return {
        text: "Failed to get response from OpenAI",
        success: false,
        error: error.error?.message || "API request failed"
      };
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      success: true
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    toast.error("Failed to connect to OpenAI API");
    return {
      text: "Error connecting to OpenAI",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function processNovelPrompt(
  prompt: string,
  project: any,
  systemInstructions: string
): Promise<OpenAIResponse> {
  const systemPrompt = `
    ${systemInstructions}
    
    You are NovelSpark, an AI assistant specialized in helping writers develop their novels.
    
    The user's current project has:
    - ${project.characters.length} characters
    - ${project.scenes.length} scenes
    - ${project.events.length} events
    - ${project.notes.length} notes
    
    When the user mentions an entity with '@' like @character/Name or @scene/Title, 
    they're referencing a specific entity in their novel.
    
    Respond in a supportive, creative way to help the writer develop their story.
    If they ask for a new entity, provide a detailed response they can save.
    If they ask about relationships between entities, provide insights based on the context.
    
    Focus on being helpful, specific, and supportive of the creative process.
  `;

  return await sendToOpenAI(
    [{ id: Date.now().toString(), role: 'user', content: prompt, timestamp: Date.now() }],
    systemPrompt
  );
}

export function parseApiKey(key: string): string {
  return key.trim();
}
