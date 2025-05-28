'use server';

import { formulaToLatex, type FormulaToLatexInput, type FormulaToLatexOutput } from '@/ai/flows/formula-to-latex';

export async function invokeFormulaToLatex(
  photoDataUri: string
): Promise<FormulaToLatexOutput | { error: string }> {
  try {
    const input: FormulaToLatexInput = { photoDataUri };
    // We are not passing formattingCodes here, as prefix/suffix will be handled client-side
    // for more direct control over the final string for copy/share.
    // If AI needs specific formatting hints, this could be revisited.
    const result = await formulaToLatex(input);
    return result;
  } catch (error) {
    console.error('Error in invokeFormulaToLatex:', error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}
