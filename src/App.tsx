
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NovelProvider } from "@/contexts/NovelContext";
import { Layout } from "@/components/Layout";

// Pages
import { HomePage } from "./pages/HomePage";
import { CharactersPage } from "./pages/CharactersPage";
import { CharacterForm } from "./pages/CharacterForm";
import { ScenesPage } from "./pages/ScenesPage";
import { SceneForm } from "./pages/SceneForm";
import { EventsPage } from "./pages/EventsPage";
import { EventForm } from "./pages/EventForm";
import { AssistantPage } from "./pages/AssistantPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NovelProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/characters" element={<Layout><CharactersPage /></Layout>} />
            <Route path="/characters/:id" element={<Layout><CharacterForm /></Layout>} />
            <Route path="/scenes" element={<Layout><ScenesPage /></Layout>} />
            <Route path="/scenes/:id" element={<Layout><SceneForm /></Layout>} />
            <Route path="/events" element={<Layout><EventsPage /></Layout>} />
            <Route path="/events/:id" element={<Layout><EventForm /></Layout>} />
            <Route path="/assistant" element={<Layout><AssistantPage /></Layout>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </NovelProvider>
  </QueryClientProvider>
);

export default App;
