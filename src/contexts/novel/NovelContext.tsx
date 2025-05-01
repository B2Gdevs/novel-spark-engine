
import { createContext } from 'react';
import { NovelContextType } from './types';

// Create the context with undefined as default value
const NovelContext = createContext<NovelContextType | undefined>(undefined);

export default NovelContext;
