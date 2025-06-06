
import React from 'react';
import type { EquationHistoryItem } from '../types';
import { HistoryItem } from './HistoryItem';

interface HistoryPanelProps {
  historyItems: EquationHistoryItem[];
  onSelectHistoryItem: (item: EquationHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  className?: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  historyItems,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  className,
}) => {
  return (
    <aside className={`flex flex-col ${className}`}>
      <h2 className="text-lg font-semibold text-sky-700 mb-3 px-1">History</h2>
      {historyItems.length === 0 ? (
        <p className="text-slate-500 italic text-sm px-1">No history yet. Rendered equations will appear here.</p>
      ) : (
        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
          {historyItems.map(item => (
            <HistoryItem
              key={item.id}
              item={item}
              onSelect={onSelectHistoryItem}
              onDelete={onDeleteHistoryItem}
            />
          ))}
        </div>
      )}
    </aside>
  );
};
    