
import React, { forwardRef } from 'react';
import { ClearIcon } from './icons';

interface LatexInputControlsProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export const LatexInputControls = forwardRef<HTMLTextAreaElement, LatexInputControlsProps>(
  ({ value, onChange, onClear }, ref) => {
    return (
      <div className="flex flex-col space-y-2 bg-white p-4 rounded-lg shadow border border-slate-200">
        <label htmlFor="latex-input" className="text-sm font-medium text-slate-700">
          Enter LaTeX Code:
        </label>
        <div className="relative">
          <textarea
            id="latex-input"
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="e.g., x^2 + y^2 = z^2"
            rows={6}
            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow resize-none custom-scrollbar text-base font-mono"
            spellCheck="false"
          />
          {value.length > 0 && (
            <button
              onClick={onClear}
              title="Clear input"
              className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ClearIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

LatexInputControls.displayName = 'LatexInputControls';
    