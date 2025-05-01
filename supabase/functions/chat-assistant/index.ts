
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment variables
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        text: "Error: OpenAI API key not configured in Supabase Edge Function secrets", 
        success: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    // Parse request body
    const { messages, systemPrompt } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ 
        text: "Error: Invalid messages format", 
        success: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Format messages for OpenAI
    const formattedMessages = [
      { role: "system", content: systemPrompt || "You are a helpful AI assistant for fiction writers. Use markdown formatting in your responses. When describing characters, scenes, or pages, use the specified format with **bold** titles." },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log('Sending request to OpenAI with messages:', JSON.stringify(formattedMessages[0]));

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        max_tokens: 1000,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(JSON.stringify({ 
        text: `Error: ${errorData.error?.message || 'Failed to get response from OpenAI'}`, 
        success: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      });
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Return the response
    return new Response(JSON.stringify({ text: result, success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    
    return new Response(JSON.stringify({ 
      text: `Error: ${error.message}`, 
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
