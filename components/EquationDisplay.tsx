
import React, { useEffect, useRef } from 'react';

// The local global declaration for window.katex has been removed.
// TypeScript will now use the global declaration from types.ts.

interface EquationDisplayProps {
  latexCode: string;
  onError: (message: string | null) => void;
}

export const EquationDisplay: React.FC<EquationDisplayProps> = ({ latexCode, onError }) => {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current && window.katex) {
      try {
        if (latexCode.trim() === '') {
          outputRef.current.innerHTML = '<p class="text-slate-500 italic">Enter LaTeX above to see it rendered here.</p>';
          onError(null);
        } else {
          window.katex.render(latexCode, outputRef.current, {
            throwOnError: false, // KaTeX will render an error message itself
            displayMode: true,
            output: 'html', // ensure HTML output for security with trust
            trust: (context: any) => context.command === '\\htmlId', // Example of trusting specific commands if needed
          });
          // Check if KaTeX rendered an error itself
          const errorMessageElement = outputRef.current.querySelector('.katex-error');
          if (errorMessageElement && errorMessageElement.textContent) {
            onError(errorMessageElement.textContent);
          } else {
            onError(null);
          }
        }
      } catch (error: any) {
        // This catch block might not be hit often if throwOnError is false,
        // but good for other unexpected issues.
        outputRef.current.innerHTML = `<p class="text-red-600 p-2 bg-red-100 rounded-md">Error rendering LaTeX: ${error.message}</p>`;
        onError(error.message || 'Unknown rendering error');
      }
    } else if (latexCode.trim() === '' && outputRef.current) {
        outputRef.current.innerHTML = '<p class="text-slate-500 italic">Enter LaTeX above to see it rendered here.</p>';
        onError(null);
    }
  }, [latexCode, onError]);

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-slate-200 min-h-[100px] flex items-center justify-center overflow-x-auto custom-scrollbar">
      <div ref={outputRef} className="w-full text-center text-xl md:text-2xl lg:text-3xl">
        {/* KaTeX output will be rendered here */}
      </div>
    </div>
  );
};
