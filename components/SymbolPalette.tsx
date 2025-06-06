
import React, { useState } from 'react';
import type { SymbolCategory, SymbolInfo } from '../types';
import { EquationPreview } from './EquationPreview'; // For rendering previews

interface SymbolPaletteProps {
  categories: SymbolCategory[];
  onSymbolClick: (symbol: SymbolInfo) => void;
  className?: string;
}

export const SymbolPalette: React.FC<SymbolPaletteProps> = ({ categories, onSymbolClick, className }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(categories[0]?.name || null);

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  return (
    <aside className={`flex flex-col space-y-2 ${className}`}>
      {categories.map(category => (
        <div key={category.name} className="rounded-lg shadow-sm border border-slate-200 bg-white">
          <button
            onClick={() => toggleCategory(category.name)}
            className="w-full text-left px-4 py-3 font-semibold text-sky-700 hover:bg-sky-50 focus:outline-none flex justify-between items-center transition-colors duration-150"
          >
            {category.name}
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${
                openCategory === category.name ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {openCategory === category.name && (
            <div className="grid grid-cols-3 gap-1 p-3 border-t border-slate-200 bg-slate-50">
              {category.symbols.map(symbol => (
                <button
                  key={symbol.name}
                  onClick={() => onSymbolClick(symbol)}
                  title={symbol.description || symbol.name}
                  className="p-2 rounded-md hover:bg-sky-100 focus:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-150 aspect-square flex items-center justify-center"
                >
                  <EquationPreview latexCode={symbol.latex.replace('{}', 'x').replace('[]','n')} className="text-sm" />
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
};
    