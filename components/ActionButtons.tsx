
import React from 'react';
import { CopyIcon } from './icons';

interface ActionButtonsProps {
  onCopyLatex: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onCopyLatex }) => {
  return (
    <div className="flex space-x-3 pt-2">
      <button
        onClick={onCopyLatex}
        className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-colors duration-150 shadow-sm"
      >
        <CopyIcon className="w-5 h-5 mr-2" />
        Copy LaTeX
      </button>
      {/* Add other buttons here if needed, e.g., Copy Image */}
    </div>
  );
};
    