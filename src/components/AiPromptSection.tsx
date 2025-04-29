
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";

export function AiPromptSection() {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission logic here
    console.log("Submitting prompt:", prompt);
    setPrompt("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <MessageSquare className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What do you want to create today?"
            className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <Button 
          type="submit" 
          className="ml-auto bg-zinc-800 hover:bg-zinc-700 text-white px-6"
        >
          Submit
        </Button>
      </form>
    </div>
  );
}
