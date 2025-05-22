
import { ReactNode } from 'react';
import { CopilotProvider as CopilotKitProvider } from '@copilotkit/react-ui';

interface CopilotProviderProps {
  children: ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
  return (
    <CopilotKitProvider
      runtimeUrl="/api/copilotkit"
    >
      {children}
    </CopilotKitProvider>
  );
}
