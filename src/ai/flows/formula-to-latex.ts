// formula-to-latex.ts
'use server';

/**
 * @fileOverview Converts an image of a mathematical formula to LaTeX code.
 *
 * - formulaToLatex - A function that handles the conversion process.
 * - FormulaToLatexInput - The input type for the formulaToLatex function.
 * - FormulaToLatexOutput - The return type for the formulaToLatex function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormulaToLatexInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a mathematical formula, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  formattingCodes: z
    .string()
    .optional()
    .describe("Optional formatting codes to be put before and after the formula (e.g., '$$')."),
});
export type FormulaToLatexInput = z.infer<typeof FormulaToLatexInputSchema>;

const FormulaToLatexOutputSchema = z.object({
  latexCode: z.string().describe('The LaTeX code representation of the formula.'),
});
export type FormulaToLatexOutput = z.infer<typeof FormulaToLatexOutputSchema>;

export async function formulaToLatex(input: FormulaToLatexInput): Promise<FormulaToLatexOutput> {
  return formulaToLatexFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formulaToLatexPrompt',
  input: {schema: FormulaToLatexInputSchema},
  output: {schema: FormulaToLatexOutputSchema},
  prompt: `You are an expert in recognizing mathematical formulas and converting them to LaTeX code.

  Given an image of a formula, your task is to generate the corresponding LaTeX code.

  Ensure that the generated LaTeX code is accurate and complete.

  Image: {{media url=photoDataUri}}

  Formatting codes: {{{formattingCodes}}}

  Output the LaTeX code:
  `,
});

const formulaToLatexFlow = ai.defineFlow(
  {
    name: 'formulaToLatexFlow',
    inputSchema: FormulaToLatexInputSchema,
    outputSchema: FormulaToLatexOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
