
import { ReactNode } from 'react';
import { CopilotKit } from '@copilotkit/react-ui';

interface CopilotProviderProps {
  children: ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
    >
      {children}
    </CopilotKit>
  );
}
