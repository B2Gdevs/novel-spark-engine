
import {
  CopilotRuntime,
  OpenAIAdapter,
} from '@copilotkit/runtime';

const serviceAdapter = new OpenAIAdapter();
const runtime = new CopilotRuntime();

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    
    // Using the handle method which is the correct method according to the API
    const response = await runtime.handle(requestBody, serviceAdapter);
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in Copilot Runtime:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
