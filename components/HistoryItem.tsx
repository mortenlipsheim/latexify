
import React from 'react';
import type { EquationHistoryItem } from '../types';
import { EquationPreview } from './EquationPreview';
import { TrashIcon } from './icons';

interface HistoryItemProps {
  item: EquationHistoryItem;
  onSelect: (item: EquationHistoryItem) => void;
  onDelete: (id: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onSelect, onDelete }) => {
  return (
    <div className="p-2.5 border border-slate-200 rounded-lg bg-white hover:shadow-md transition-shadow duration-150 group">
      <button
        onClick={() => onSelect(item)}
        className="w-full text-left block mb-1 p-1 rounded hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-400"
        title="Load this equation"
      >
        <EquationPreview latexCode={item.latex} className="katex-preview text-sm" />
      </button>
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-slate-500">
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onSelect
            onDelete(item.id);
          }}
          title="Delete this item"
          className="p-1 text-slate-400 hover:text-red-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
    