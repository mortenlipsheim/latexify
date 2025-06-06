
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SymbolPalette } from './components/SymbolPalette';
import { LatexInputControls } from './components/LatexInputControls';
import { EquationDisplay } from './components/EquationDisplay';
import { ActionButtons } from './components/ActionButtons';
import { HistoryPanel } from './components/HistoryPanel';
import type { EquationHistoryItem, SymbolInfo } from './types';
import { SYMBOL_CATEGORIES } from './constants'; // Ensure this path is correct

const MAX_HISTORY_ITEMS = 30;

const App: React.FC = () => {
  const [latexInput, setLatexInput] = useState<string>('\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}');
  const [debouncedLatexInput, setDebouncedLatexInput] = useState<string>(latexInput);
  const [history, setHistory] = useState<EquationHistoryItem[]>([]);
  const [renderingError, setRenderingError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('latexHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
      localStorage.removeItem('latexHistory'); // Clear corrupted data
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('latexHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage:", error);
    }
  }, [history]);

  // Debounce LaTeX input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLatexInput(latexInput);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [latexInput]);
  
  const addToHistory = useCallback((latex: string) => {
    if (!latex.trim() || renderingError) return;

    setHistory(prevHistory => {
      // Avoid adding duplicates or if it's same as the most recent one
      if (prevHistory.length > 0 && prevHistory[0].latex === latex) {
        return prevHistory;
      }
      const newItem: EquationHistoryItem = {
        id: Date.now().toString(),
        latex,
        timestamp: new Date(),
      };
      const newHistory = [newItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
      return newHistory;
    });
  }, [renderingError]);

  // Add to history when debounced input changes and is valid
  useEffect(() => {
    if (debouncedLatexInput.trim() && !renderingError) {
      // Add to history only if it's different from current input to avoid loop with loadFromHistory
      if (history.length === 0 || history[0].latex !== debouncedLatexInput) {
         addToHistory(debouncedLatexInput);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLatexInput, renderingError]); // Intentionally not including addToHistory, history to avoid loops


  const handleSymbolInsert = useCallback((symbol: SymbolInfo) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    let textToInsert = symbol.latex;
    
    // Smart insertion for templates like \frac{}{}
    // Place cursor inside the first empty curly braces
    let cursorPos = textToInsert.length;
    if (symbol.type === 'template') {
        const firstBrace = textToInsert.indexOf('{}');
        if (firstBrace !== -1) {
            cursorPos = firstBrace + 1;
        } else {
           const firstBracket = textToInsert.indexOf('()');
            if (firstBracket !== -1) {
                cursorPos = firstBracket + 1;
            }
        }
    }


    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
    setLatexInput(newText);

    // Focus and set cursor position
    textarea.focus();
    // Needs a slight delay for the state update to propagate to the textarea value
    setTimeout(() => {
      textarea.setSelectionRange(start + cursorPos, start + cursorPos);
    }, 0);

  }, []);

  const handleClearInput = useCallback(() => {
    setLatexInput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleCopyLatex = useCallback(async () => {
    if (!latexInput.trim()) return;
    try {
      await navigator.clipboard.writeText(latexInput);
      setToastMessage('LaTeX copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy LaTeX: ', err);
      setToastMessage('Failed to copy LaTeX.');
    }
    setTimeout(() => setToastMessage(null), 2000);
  }, [latexInput]);

  const loadFromHistory = useCallback((item: EquationHistoryItem) => {
    setLatexInput(item.latex);
  }, []);

  const deleteFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    setToastMessage('History item removed.');
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800">
      <Header title="LaTeXify" />
      <div className="flex flex-1 overflow-hidden">
        <SymbolPalette
          categories={SYMBOL_CATEGORIES}
          onSymbolClick={handleSymbolInsert}
          className="w-60 md:w-72 lg:w-80 p-3 bg-slate-50 shadow-lg overflow-y-auto custom-scrollbar"
        />
        <main className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar">
          <LatexInputControls
            ref={textareaRef}
            value={latexInput}
            onChange={setLatexInput}
            onClear={handleClearInput}
          />
          <EquationDisplay
            latexCode={debouncedLatexInput}
            onError={setRenderingError}
          />
          <ActionButtons onCopyLatex={handleCopyLatex} />
        </main>
        <HistoryPanel
          historyItems={history}
          onSelectHistoryItem={loadFromHistory}
          onDeleteHistoryItem={deleteFromHistory}
          className="w-60 md:w-72 lg:w-80 p-3 bg-slate-50 shadow-lg overflow-y-auto custom-scrollbar"
        />
      </div>
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-sky-600 text-white py-2 px-4 rounded-md shadow-xl animate-fadeInOut">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;
