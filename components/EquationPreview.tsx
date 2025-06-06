
import React, { useEffect, useRef } from 'react';

// The local global declaration for window.katex has been removed.
// TypeScript will now use the global declaration from types.ts.

interface EquationPreviewProps {
  latexCode: string;
  className?: string;
}

export const EquationPreview: React.FC<EquationPreviewProps> = ({ latexCode, className }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current && window.katex && latexCode) {
      try {
        window.katex.render(latexCode, ref.current, {
          throwOnError: false,
          displayMode: false, // Important for inline rendering
          output: 'html',
        });
      } catch (e) {
        console.error("KaTeX preview rendering error:", e);
        if (ref.current) {
          ref.current.textContent = latexCode; // Fallback to raw LaTeX
        }
      }
    } else if (ref.current && !latexCode) {
        ref.current.innerHTML = ''; // Clear if no LaTeX
    }
  }, [latexCode]);

  return <span ref={ref} className={className}></span>;
};
