
import { ReactNode } from "react";
import { NovelProviderCore } from "./provider/NovelProviderCore";
import { NovelDataFetcher } from "./provider/NovelDataFetcher";
import { useProjectState } from "./useProjectState";
import { useContext } from "react";
import NovelContext from "./NovelContext";

export function NovelProvider({ children }: { children: ReactNode }) {
  const projectState = useProjectState();

  return (
    <NovelDataFetcher project={projectState.project} setProject={projectState.setProject}>
      <NovelProviderCore>
        {children}
      </NovelProviderCore>
    </NovelDataFetcher>
  );
}

export const useNovel = () => {
  const context = useContext(NovelContext);
  if (context === undefined) {
    throw new Error("useNovel must be used within a NovelProvider");
  }
  return context;
};
