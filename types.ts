export interface SymbolInfo {
  name: string;
  latex: string;
  type: 'symbol' | 'template';
  description?: string; // Optional description for tooltip
}

export interface SymbolCategory {
  name: string;
  symbols: SymbolInfo[];
}

export interface EquationHistoryItem {
  id: string;
  latex: string;
  timestamp: Date;
}

// Global declaration for KaTeX on the Window object
declare global {
  interface Window {
    katex?: {
      render: (expression: string, element: HTMLElement, options?: KatexOptions) => void;
      // Potentially add other KaTeX functions if used, e.g., __parse if needed
    };
  }
}

// It's good practice to define types for options objects if they are complex.
// For KaTeX, the options can be quite varied. 'any' is used in the original
// components, but a more specific type could be beneficial.
// See https://katex.org/docs/options.html
// Using a simplified version here based on current usage.
interface KatexOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
  errorColor?: string;
  macros?: object;
  colorIsTextColor?: boolean;
  strict?: boolean | string | Function;
  output?: 'html' | 'mathml' | 'htmlAndMathml';
  trust?: boolean | ((context: TrustContext) => boolean);
  leqno?: boolean;
  fleqn?: boolean;
  maxSize?: number;
  maxExpand?: number;
  minRuleThickness?: number;
  globalGroup?: boolean;
  // ... and other options
}

interface TrustContext {
  command: string;
  url: string;
  protocol: string;
  // ... other context properties
}
