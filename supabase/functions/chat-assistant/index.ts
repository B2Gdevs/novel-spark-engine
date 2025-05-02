
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { messages, systemPrompt } = await req.json();

    // Get the API key from environment variables
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create a default system message if one is not provided
    const defaultSystemMessage = {
      role: "system",
      content: "You are an AI assistant for novel writing. Help the user develop characters, plot, settings, and other elements of their novel."
    };

    // Combine the user-provided system prompt with the default message
    const combinedSystemPrompt = systemPrompt
      ? { role: "system", content: systemPrompt }
      : defaultSystemMessage;

    // Prepare the messages to send to OpenAI
    const formattedMessages = [
      combinedSystemPrompt,
      ...(messages || [])
    ];

    // Call the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Error from OpenAI API", details: errorData }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store the conversation history in Supabase if context is provided
    if (req.headers.get("entity-type") && req.headers.get("entity-id") && req.headers.get("book-id")) {
      const entityType = req.headers.get("entity-type")!;
      const entityId = req.headers.get("entity-id")!;
      const bookId = req.headers.get("book-id")!;
      
      // Store the conversation in entity_chats
      try {
        await supabase
          .from("entity_chats")
          .upsert({
            entity_type: entityType,
            entity_id: entityId,
            book_id: bookId,
            chat_history: formattedMessages.concat([
              {
                role: "assistant",
                content: data.choices[0].message.content
              }
            ]),
            updated_at: new Date().toISOString()
          }, { onConflict: "entity_type,entity_id" });
      } catch (error) {
        console.error("Error storing conversation history:", error);
        // Continue execution even if database storage fails
      }
    }

    // Extract the assistant's response
    const assistantResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ text: assistantResponse }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in chat-assistant function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
