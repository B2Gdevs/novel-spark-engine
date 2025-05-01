
import { toast } from "sonner";
import { NovelProject } from "@/types/novel";

export function useStorage(
  project: NovelProject,
  setProject: React.Dispatch<React.SetStateAction<NovelProject>>
) {
  const saveProject = () => {
    try {
      localStorage.setItem("novelProject", JSON.stringify(project));
      toast.success("Project saved successfully");
    } catch (e) {
      console.error("Error saving project to localStorage:", e);
      toast.error("Failed to save project");
    }
  };

  const loadProject = (loadedProject: NovelProject) => {
    try {
      setProject(loadedProject);
      localStorage.setItem("novelProject", JSON.stringify(loadedProject));
      toast.success("Project loaded successfully");
    } catch (e) {
      console.error("Error loading project:", e);
      toast.error("Failed to load project");
    }
  };

  return {
    saveProject,
    loadProject
  };
}
